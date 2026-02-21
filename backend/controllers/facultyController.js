import { facultyService } from "../services/facultyService.js";

export const createFaculty = async (req, res) => {
  try {
    const data = await facultyService.createFaculty(req.user._id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getFaculty = async (req, res) => {
  try {
    const data = await facultyService.getAllFaculty(req.user._id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateFaculty = async (req, res) => {
  try {
    const data = await facultyService.updateFaculty(req.user._id, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const syncCourses = async (req, res) => {
  try {
    const { courseIds } = req.body; // Array of IDs or codes
    const result = await facultyService.updateFacultyCourses(req.user._id, req.params.id, courseIds);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const result = await facultyService.deleteFaculty(req.user._id, req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};