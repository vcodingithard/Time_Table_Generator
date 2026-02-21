// controllers/metadataController.js

import { metadataService } from "../services/metadataService.js";

export const createMetadata = async (req, res) => {
  try {
    const data = await metadataService.createMetadata(
      req.user._id,
      req.body
    );

    res.status(201).json({ success: true, data });
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

export const getMetadataById = async (req, res) => {
  try {
    const data = await metadataService.getMetadataById(
      req.user._id,
      req.params.id
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const updateMetadata = async (req, res) => {
  try {
    const data = await metadataService.updateMetadata(
      req.user._id,
      req.params.id,
      req.body
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteMetadata = async (req, res) => {
  try {
    await metadataService.deleteMetadata(
      req.user._id,
      req.params.id
    );

    res.json({ success: true, message: "Metadata deleted" });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};