import { classService } from "../services/classService.js";

/**
 * CREATE A NEW CLASS
 */
export const createClass = async (req, res) => {
  try {
    const instituteId = req.user?._id;
    if (!instituteId) return res.status(401).json({ message: "Unauthorized" });

    const cls = await classService.createClass(instituteId, req.body);
    res.status(201).json({ success: true, data: cls });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * GET ALL CLASSES FOR THE INSTITUTE
 */
export const getClasses = async (req, res) => {
  try {
    const data = await classService.getAllClasses(req.user._id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * GET A SINGLE CLASS BY ID
 */
export const getClassById = async (req, res) => {
  try {
    const data = await classService.getClassById(req.user._id, req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

/**
 * UPDATE CLASS INFO
 */
export const updateClass = async (req, res) => {
  try {
    const data = await classService.updateClass(req.user._id, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * DELETE CLASS (AND ASSOCIATED DATA)
 */
export const deleteClass = async (req, res) => {
  try {
    const result = await classService.deleteClass(req.user._id, req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};