import { courseService } from "../services/courseService.js";

export const createCourse = async (req, res) => {
  try {
    const data = await courseService.createCourse(req.user._id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const data = await courseService.getAllCourses(req.user._id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const data = await courseService.getCourseById(req.user._id, req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const data = await courseService.updateCourse(req.user._id, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const result = await courseService.deleteCourse(req.user._id, req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};