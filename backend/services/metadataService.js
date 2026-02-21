import Metadata from "../models/Metadata.js";

export const metadataService = {
  /**
   * CREATE OR INITIALIZE METADATA
   */
  upsertMetadata: async (instituteId, data) => {
    const { classId, slots_per_day, total_days, slot_times, breaks } = data;

    // Use findOneAndUpdate with upsert: true to handle both create and update
    const metadata = await Metadata.findOneAndUpdate(
      { institute: instituteId, classId },
      { 
        $set: { 
          slots_per_day: Number(slots_per_day),
          total_days: Number(total_days) || 6,
          slot_times,
          breaks
        } 
      },
      { new: true, upsert: true, runValidators: true }
    );

    return metadata;
  },

  /**
   * GET ALL METADATA FOR INSTITUTE
   */
  getAllMetadata: async (instituteId) => {
    return await Metadata.find({ institute: instituteId })
      .populate({
        path: "classId",
        select: "semester section"
      })
      .sort({ updatedAt: -1 });
  },

  /**
   * GET METADATA FOR A SPECIFIC CLASS
   */
  getByClassId: async (instituteId, classId) => {
    const meta = await Metadata.findOne({ institute: instituteId, classId })
      .populate("classId");
    if (!meta) throw new Error("Configuration not found for this class");
    return meta;
  },

  /**
   * DELETE METADATA
   */
  deleteMetadata: async (instituteId, metaId) => {
    const deleted = await Metadata.findOneAndDelete({ 
      _id: metaId, 
      institute: instituteId 
    });
    if (!deleted) throw new Error("Metadata not found");
    return { message: "Metadata deleted successfully" };
  }
};