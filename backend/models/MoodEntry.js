import mongoose from "mongoose";

const moodEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mood_text: { type: String },
  mood_audio: { type: String }, // URL or file path to uploaded speech
  mood_image: { type: String }, // URL or file path to uploaded image
}, { timestamps: true });

export default mongoose.model("MoodEntry", moodEntrySchema);
