import Timetable from "../models/Timetable.js";
import Class from "../models/Class.js";
import Metadata from "../models/Metadata.js";
import Course from "../models/Course.js";
import Faculty from "../models/Faculty.js";
import Room from "../models/Room.js";
import { callAIModel } from "../utils/aiClient.js";
import mongoose from "mongoose";

export const timetableService = {
  /**
   * GENERATE TIMETABLE
   * Creates a brand new timetable or throws an error if one exists.
   */
  generateTimetable: async (instituteId, classId, userSuggestions) => {
    // 1. Idempotency Check: Prevent duplicates
    const existing = await Timetable.findOne({ institute: instituteId, classId });
    if (existing) {
      throw new Error("A timetable already exists for this class. Please delete it before generating a new one.");
    }

    // 2. Data Fetching
    const [targetClass, metadata, courses, faculties, rooms, existingTimetables] = 
      await Promise.all([
        Class.findById(classId),
        Metadata.findOne({ institute: instituteId, classId }),
        Course.find({ institute: instituteId, classIds: classId }),
        Faculty.find({ institute: instituteId }),
        Room.find({ institute: instituteId }),
        Timetable.find({ institute: instituteId, classId: { $ne: classId } })
      ]);

    if (!targetClass) throw new Error("Target class not found.");
    if (!metadata) throw new Error("Class metadata (slots/breaks) is missing.");
    if (courses.length === 0) throw new Error("No courses assigned to this class.");

    // 3. Busy Slots (Conflict Matrix)
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

    // 4. AI Prompt Construction
    const prompt = `
      Act as a University Scheduling Algorithm for Class ${targetClass.semester}-${targetClass.section}.
      
      CONSTRAINTS:
      - Slots per day: ${metadata.slots_per_day}.
      - Breaks (DO NOT SCHEDULE): ${JSON.stringify(metadata.breaks)}.
      - Forbidden Slots (Conflicts): ${JSON.stringify(occupiedSlots)}.
      
      RESOURCES (Use these EXACT 24-char IDs):
      - Rooms: ${JSON.stringify(rooms.map(r => ({ id: r._id.toString(), no: r.room_no })))}
      - Courses: ${JSON.stringify(courses.map(c => ({ id: c._id.toString(), name: c.course_name })))}
      - Faculty: ${JSON.stringify(faculties.map(f => ({ id: f._id.toString(), name: f.faculty_name })))}
      - User Request: ${userSuggestions || "None"}

      STRICT RULES:
      1. Return ONLY valid JSON.
      2. Use the EXACT ObjectIDs provided. Do not truncate them.
      3. Format: {"timetable": {"MONDAY": [{"course": "ID", "faculty": "ID", "room": "ID", "slot_index": 0, "activity": "LECTURE"}]}}
    `;

    // 5. AI Call & Parsing
    let aiResponse;
    try {
      aiResponse = await callAIModel(prompt);
      if (!aiResponse || !aiResponse.timetable) {
        throw new Error("AI returned an empty or invalid schedule.");
      }
    } catch (err) {
      throw new Error(`AI Communication Failed: ${err.message}`);
    }

    // 6. SANITIZATION: Validate IDs before saving to MongoDB
    const cleanTimetable = {};
    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

    try {
      days.forEach(day => {
        const daySlots = aiResponse.timetable[day] || [];
        cleanTimetable[day] = daySlots
          .map(slot => {
            // Validate if AI returned valid 24-char hex strings
            const isCourseValid = mongoose.Types.ObjectId.isValid(slot.course);
            const isFacultyValid = mongoose.Types.ObjectId.isValid(slot.faculty);
            const isRoomValid = mongoose.Types.ObjectId.isValid(slot.room);

            if (!isCourseValid || !isFacultyValid || !isRoomValid) {
              console.warn(`Skipping invalid slot in ${day} due to corrupted ID.`);
              return null;
            }

            return {
              course: new mongoose.Types.ObjectId(slot.course),
              faculty: new mongoose.Types.ObjectId(slot.faculty),
              room: new mongoose.Types.ObjectId(slot.room),
              slot_index: Number(slot.slot_index),
              activity: slot.activity || "LECTURE"
            };
          })
          .filter(slot => slot !== null); // Remove failed mappings
      });
    } catch (err) {
      throw new Error("Data transformation failed. AI output format was unexpected.");
    }

    // 7. Final Database Save
    try {
      const newTimetable = new Timetable({
        institute: instituteId,
        classId,
        display_info: {
          semester: targetClass.semester,
          section: targetClass.section,
          department: targetClass.department_name || targetClass.department
        },
        timetable: cleanTimetable,
        faculty_involved: [...new Set(
          Object.values(cleanTimetable)
            .flat()
            .map(s => s.faculty.toString())
        )]
      });

      return await newTimetable.save();
    } catch (dbErr) {
      throw new Error(`Database Save Error: ${dbErr.message}`);
    }
  },

  /**
   * SEARCH TIMETABLES
   */
  searchTimetables: async (instituteId, filters) => {
    const query = { institute: instituteId };
    if (filters.semester) query["display_info.semester"] = Number(filters.semester);
    if (filters.section) query["display_info.section"] = filters.section;
    if (filters.facultyId) query.faculty_involved = filters.facultyId;

    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    let populateQuery = days.flatMap(day => ([
      { path: `timetable.${day}.course` },
      { path: `timetable.${day}.faculty` },
      { path: `timetable.${day}.room` }
    ]));

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