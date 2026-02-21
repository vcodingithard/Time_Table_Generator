import Course from "../models/Course.js";

export const courseService = {
  createCourse: async (instituteId, data) => {
    const { course_code, classIds, teachers_assigned } = data;

    // Check duplicate
    const exists = await Course.findOne({ institute: instituteId, course_code });
    if (exists) throw new Error("Course code already exists in this institute");

    return await Course.create({
      ...data,
      institute: instituteId,
      classIds: classIds || [],
      teachers_assigned: teachers_assigned || []
    });
  },

  getAllCourses: async (instituteId) => {
    return await Course.find({ institute: instituteId })
      .populate("classIds", "semester section")
      .populate("teachers_assigned", "faculty_name faculty_code")
      .sort({ course_code: 1 });
  },

  getCourseById: async (instituteId, courseId) => {
    const course = await Course.findOne({ _id: courseId, institute: instituteId })
      .populate("classIds")
      .populate("teachers_assigned");
    if (!course) throw new Error("Course not found");
    return course;
  },

  updateCourse: async (instituteId, courseId, updateData) => {
    const updated = await Course.findOneAndUpdate(
      { _id: courseId, institute: instituteId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("classIds teachers_assigned");
    
    if (!updated) throw new Error("Course not found or unauthorized");
    return updated;
  },

  deleteCourse: async (instituteId, courseId) => {
    const deleted = await Course.findOneAndDelete({ _id: courseId, institute: instituteId });
    if (!deleted) throw new Error("Course not found");
    return { message: "Course deleted successfully" };
  }
};