import { metadataService } from "../services/metadataService.js";

export const saveMetadata = async (req, res) => {
  try {
    const data = await metadataService.upsertMetadata(req.user._id, req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAllMetadata = async (req, res) => {
  try {
    const data = await metadataService.getAllMetadata(req.user._id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMetadataByClass = async (req, res) => {
  try {
    const data = await metadataService.getByClassId(req.user._id, req.params.classId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const deleteMetadata = async (req, res) => {
  try {
    const result = await metadataService.deleteMetadata(req.user._id, req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};