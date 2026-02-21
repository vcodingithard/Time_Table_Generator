import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const instituteSchema = new mongoose.Schema({
  institute_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  department_name: { type: String, required: true }
}, { timestamps: true });

// Normalize the plugin import for ES Modules
const plugin = (typeof passportLocalMongoose === 'function') 
  ? passportLocalMongoose 
  : passportLocalMongoose.default;

instituteSchema.plugin(plugin, { usernameField: "email" });

export default mongoose.models.Institute || mongoose.model("Institute", instituteSchema);