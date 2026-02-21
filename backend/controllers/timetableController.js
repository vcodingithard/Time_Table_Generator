import { timetableService } from "../services/timetableService.js";

export const createTimetable = async (req, res) => {
  try {
    const { classId, suggestions } = req.body;
    const data = await timetableService.generateTimetable(req.user._id, classId, suggestions);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const searchTimetables = async (req, res) => {
  try {
    // Allows searching by ?semester=5&section=A or ?facultyId=ID
    const data = await timetableService.searchTimetables(req.user._id, req.query);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTimetable = async (req, res) => {
  try {
    await timetableService.deleteTimetable(req.user._id, req.params.id);
    res.json({ success: true, message: "Timetable removed successfully" });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};