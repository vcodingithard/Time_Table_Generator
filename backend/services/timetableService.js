import Timetable from "../models/Timetable.js";
import Class from "../models/Class.js";
import Metadata from "../models/Metadata.js";
import Course from "../models/Course.js";
import Faculty from "../models/Faculty.js";
import Room from "../models/Room.js";
import { callAIModel } from "../utils/aiClient.js";

export const timetableService = {
  /**
   * GENERATE TIMETABLE
   * Uses OpenRouter AI to generate a non-conflicting schedule
   */
  generateTimetable: async (instituteId, classId, userSuggestions) => {
    // 1. Fetch all necessary context in one parallel call
    const [targetClass, metadata, courses, faculties, rooms, existingTimetables] = 
      await Promise.all([
        Class.findById(classId),
        Metadata.findOne({ classId }),
        Course.find({ institute: instituteId, classIds: classId }),
        Faculty.find({ institute: instituteId }),
        Room.find({ institute: instituteId }),
        Timetable.find({ institute: instituteId, classId: { $ne: classId } })
      ]);

    // Validation
    if (!targetClass) throw new Error(`Class with ID ${classId} not found.`);
    if (!metadata) throw new Error("Metadata configuration (slots/times) missing for this class.");
    if (courses.length === 0) throw new Error("No courses found linked to this class.");

    // 2. Build Conflict Matrix (Busy Slots for Rooms & Faculty)
    const occupiedSlots = existingTimetables.flatMap(tt => 
      Object.entries(tt.timetable).flatMap(([day, sessions]) => 
        sessions.map(s => ({
          day,
          slot: s.slot_index,
          faculty: s.faculty?.toString(),
          room: s.room?.toString()
        }))
      )
    );

    // 3. Prepare the AI Prompt
    const prompt = `
      Act as a University Scheduling Algorithm for Class ${targetClass.semester}-${targetClass.section}.
      
      CONSTRAINTS:
      - Slots per day: ${metadata.slots_per_day}.
      - Breaks (DO NOT SCHEDULE HERE): ${JSON.stringify(metadata.breaks)}.
      - Already Occupied Slots (Forbidden): ${JSON.stringify(occupiedSlots)}.
      
      RESOURCES:
      - Available Rooms: ${JSON.stringify(rooms.map(r => ({id: r._id, no: r.room_no, type: r.room_type})))}
      - Courses to Schedule: ${JSON.stringify(courses.map(c => ({id: c._id, name: c.course_name, hrs: c.hours_per_week, type: c.course_type})))}
      - Faculty: ${JSON.stringify(faculties.map(f => ({id: f._id, name: f.faculty_name})))}
      - User Suggestions: ${userSuggestions}

      OUTPUT RULES:
      - Return ONLY a valid JSON.
      - Map each day (MONDAY to SATURDAY).
      - Ensure activity matches Course Type (LECTURE/LAB).
      
      JSON FORMAT:
      {
        "timetable": {
          "MONDAY": [{"course": "ID", "faculty": "ID", "room": "ID", "slot_index": 0, "activity": "LECTURE"}],
          "TUESDAY": [],
          ...
        }
      }
    `;

    // 4. Call AI Helper (OpenRouter)
    const aiResponse = await callAIModel(prompt);

    // 5. Update or Create Timetable in DB
    return await Timetable.findOneAndUpdate(
      { institute: instituteId, classId },
      {
        institute: instituteId,
        classId,
        display_info: {
          semester: targetClass.semester,
          section: targetClass.section,
          department: targetClass.department_name || targetClass.department
        },
        timetable: aiResponse.timetable,
        faculty_involved: [...new Set(
          Object.values(aiResponse.timetable)
            .flat()
            .filter(s => s.faculty)
            .map(s => s.faculty)
        )]
      },
      { upsert: true, new: true }
    );
  },

  /**
   * SEARCH TIMETABLES
   * Filter by semester, section, or faculty
   */
  searchTimetables: async (instituteId, filters) => {
    const query = { institute: instituteId };
    
    if (filters.semester) query["display_info.semester"] = Number(filters.semester);
    if (filters.section) query["display_info.section"] = filters.section;
    if (filters.facultyId) query.faculty_involved = filters.facultyId;

    // Helper to populate all days
    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    let populateQuery = days.map(day => ([
      { path: `timetable.${day}.course` },
      { path: `timetable.${day}.faculty` },
      { path: `timetable.${day}.room` }
    ])).flat();

    return await Timetable.find(query)
      .populate("classId")
      .populate(populateQuery)
      .sort({ updatedAt: -1 });
  },

  /**
   * DELETE TIMETABLE
   */
  deleteTimetable: async (instituteId, id) => {
    const deleted = await Timetable.findOneAndDelete({ _id: id, institute: instituteId });
    if (!deleted) throw new Error("Timetable not found or unauthorized.");
    return deleted;
  }
};