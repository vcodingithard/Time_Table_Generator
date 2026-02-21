import Faculty from "../models/Faculty.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";

export const facultyService = {
  createFaculty: async (instituteId, data) => {
    const { faculty_code } = data;
    const exists = await Faculty.findOne({ institute: instituteId, faculty_code });
    if (exists) throw new Error("Faculty code already exists in your institute");

    return await Faculty.create({
      ...data,
      institute: instituteId
    });
  },

  getAllFaculty: async (instituteId) => {
    return await Faculty.find({ institute: instituteId }).sort({ faculty_name: 1 });
  },

  updateFaculty: async (instituteId, facultyId, updateData) => {
    const updated = await Faculty.findOneAndUpdate(
      { _id: facultyId, institute: instituteId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!updated) throw new Error("Faculty not found");
    return updated;
  },

  /**
   * Complex Logic: Synchronize Faculty and Courses
   */
  updateFacultyCourses: async (instituteId, facultyId, courseIdentifiers) => {
    // 1. Resolve identifiers (mix of IDs and course_codes) to ObjectIds
    const resolvedIds = await Promise.all(courseIdentifiers.map(async (item) => {
      if (mongoose.Types.ObjectId.isValid(item)) return item;
      const found = await Course.findOne({ institute: instituteId, course_code: item });
      return found ? found._id : null;
    }));

    const validCourseIds = resolvedIds.filter(id => id !== null);

    // 2. Remove this faculty from ANY course they were previously assigned to
    await Course.updateMany(
      { institute: instituteId, teachers_assigned: facultyId },
      { $pull: { teachers_assigned: facultyId } }
    );

    // 3. Add this faculty to the teachers_assigned array of the new courses
    await Course.updateMany(
      { _id: { $in: validCourseIds }, institute: instituteId },
      { $addToSet: { teachers_assigned: facultyId } }
    );

    return { success: true, count: validCourseIds.length };
  },

  deleteFaculty: async (instituteId, facultyId) => {
    const deleted = await Faculty.findOneAndDelete({ _id: facultyId, institute: instituteId });
    if (!deleted) throw new Error("Faculty not found");

    // Cleanup: Remove this faculty from all course assignments
    await Course.updateMany(
      { institute: instituteId, teachers_assigned: facultyId },
      { $pull: { teachers_assigned: facultyId } }
    );

    return { message: "Faculty deleted and course assignments cleaned" };
  }
};