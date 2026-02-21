import Class from "../models/Class.js";
import Metadata from "../models/Metadata.js";

export const classService = {
  createClass: async (instituteId, data) => {
    const { semester, section, room, coordinator } = data;

    const exists = await Class.findOne({ institute: instituteId, semester, section });
    if (exists) throw new Error("Class already exists for this semester and section");

    return await Class.create({
      institute: instituteId,
      semester,
      section,
      room,
      coordinator,
    });
  },

  getAllClasses: async (instituteId) => {
    return await Class.find({ institute: instituteId })
      .populate("room", "room_no room_type")
      .populate("coordinator", "faculty_name faculty_code")
      .sort({ semester: 1, section: 1 });
  }
  ,
  updateClass: async (instituteId, classId, updateData) => {

    const updatedClass = await Class.findOneAndUpdate(
      { _id: classId, institute: instituteId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("room coordinator");

    if (!updatedClass) throw new Error("Class not found or unauthorized");

    // 2. If slots_per_day or total_days are in the update, sync Metadata
    if (updateData.slots_per_day || updateData.total_days) {
      await Metadata.findOneAndUpdate(
        { classId, institute: instituteId },
        { 
          $set: { 
            ...(updateData.slots_per_day && { slots_per_day: updateData.slots_per_day }),
            ...(updateData.total_days && { total_days: updateData.total_days })
          } 
        }
      );
    }

    return updatedClass;
  },

  deleteClass: async (instituteId, classId) => {
    // 1. Delete the Class
    const deletedClass = await Class.findOneAndDelete({ 
      _id: classId, 
      institute: instituteId 
    });

    if (!deletedClass) throw new Error("Class not found");

    // 2. Cascade: Delete associated Metadata
    await Metadata.deleteMany({ classId, institute: instituteId });

    // 3. Cascade: Delete associated Timetable (if any exists)
    await Timetable.deleteMany({ classId, institute: instituteId });

    return { message: "Class and associated data deleted successfully" };
  }
};