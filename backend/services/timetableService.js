import Timetable from "../models/Timetable.js";
import Class from "../models/Class.js";
import Metadata from "../models/Metadata.js";
import Course from "../models/Course.js";
import Faculty from "../models/Faculty.js";
import Room from "../models/Room.js";
import { callAIModel } from "../utils/aiClient.js";

export const timetableService = {
  // CREATE (Generate)
  generateTimetable: async (instituteId, classId, userSuggestions) => {
    const [targetClass, metadata, courses, faculties, rooms, existingTimetables] = 
      await Promise.all([
        Class.findById(classId),
        Metadata.findOne({ classId }),
        Course.find({ institute: instituteId, classIds: classId }),
        Faculty.find({ institute: instituteId }),
        Room.find({ institute: instituteId }),
        Timetable.find({ institute: instituteId, classId: { $ne: classId } })
      ]);

    if (!metadata) throw new Error("Metadata configuration missing for this class.");

    // Extract conflicts to prevent AI from double-booking faculty/rooms
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

    const prompt = `
      Act as a University Scheduling Algorithm for Class ${targetClass.semester}-${targetClass.section}.
      Data: Slots/Day: ${metadata.slots_per_day}. Breaks: ${JSON.stringify(metadata.breaks)}.
      Forbidden Slots (Already occupied in other classes): ${JSON.stringify(occupiedSlots)}
      Resources: 
      - Rooms: ${JSON.stringify(rooms.map(r => ({id: r._id, no: r.room_no, type: r.room_type})))}
      - Courses: ${JSON.stringify(courses.map(c => ({id: c._id, name: c.course_name, hrs: c.hours_per_week, type: c.course_type})))}
      - Faculty: ${JSON.stringify(faculties.map(f => ({id: f._id, name: f.faculty_name})))}
      User Suggestions: ${userSuggestions}

      Output JSON format:
      {
        "timetable": {
          "MONDAY": [{"course": "ID", "faculty": "ID", "room": "ID", "slot_index": 0, "activity": "LECTURE"}],
          ... (for all days)
        }
      }
    `;

    const aiResponse = await callAIModel(prompt);

    // Save using your schema structure
    return await Timetable.findOneAndUpdate(
      { institute: instituteId, classId },
      {
        institute: instituteId,
        classId,
        display_info: {
          semester: targetClass.semester,
          section: targetClass.section,
          department: targetClass.department_name
        },
        timetable: aiResponse.timetable,
        faculty_involved: [...new Set(Object.values(aiResponse.timetable).flat().map(s => s.faculty))]
      },
      { upsert: true, new: true }
    );
  },

  // SEARCH / FETCH
  searchTimetables: async (instituteId, filters) => {
    const query = { institute: instituteId };
    
    if (filters.semester) query["display_info.semester"] = Number(filters.semester);
    if (filters.section) query["display_info.section"] = filters.section;
    if (filters.facultyId) query.faculty_involved = filters.facultyId;

    return await Timetable.find(query)
      .populate("classId")
      .populate("timetable.MONDAY.course timetable.MONDAY.faculty timetable.MONDAY.room")
      // Add other days population here if needed or handle on frontend
      .sort({ updatedAt: -1 });
  },

  // DELETE
  deleteTimetable: async (instituteId, id) => {
    const deleted = await Timetable.findOneAndDelete({ _id: id, institute: instituteId });
    if (!deleted) throw new Error("Timetable not found");
    return deleted;
  }
};