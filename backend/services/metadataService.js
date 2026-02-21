// services/metadataService.js

import Metadata from "../models/Metadata.js";

export const metadataService = {

  // CREATE
  async createMetadata(instituteId, data) {
    const metadata = new Metadata({
      institute: instituteId,
      ...data
    });

    return await metadata.save();
  },

  // READ ALL
  async getAllMetadata(instituteId) {
    return await Metadata.find({ institute: instituteId })
      .populate("classId", "semester section")
      .sort({ createdAt: -1 });
  },

  // READ ONE
  async getMetadataById(instituteId, id) {
    const metadata = await Metadata.findOne({
      _id: id,
      institute: instituteId
    }).populate("classId");

    if (!metadata) {
      throw new Error("Metadata not found");
    }

    return metadata;
  },

  // UPDATE
  async updateMetadata(instituteId, id, data) {
    const updated = await Metadata.findOneAndUpdate(
      { _id: id, institute: instituteId },
      data,
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new Error("Metadata not found");
    }

    return updated;
  },

  // DELETE
  async deleteMetadata(instituteId, id) {
    const deleted = await Metadata.findOneAndDelete({
      _id: id,
      institute: instituteId
    });

    if (!deleted) {
      throw new Error("Metadata not found");
    }

    return deleted;
  }
};