import mongoose, { Schema } from "mongoose";
const UniversitySchema = new Schema({
    name: { type: String, required: true },
    rank: { type: Number },
    city: { type: String },
    country: { type: String },
    website: { type: String },
    photoUrl: { type: String },
    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], required: true }, // [lon, lat]
    },
    programs: { type: Schema.Types.Mixed }, // flexible discipline -> ProgramInfo
}, { timestamps: true });
UniversitySchema.index({ location: "2dsphere" }); // ✅ spatial queries if needed
export default mongoose.model("University", UniversitySchema);
