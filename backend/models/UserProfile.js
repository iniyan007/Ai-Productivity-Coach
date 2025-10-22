import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  screetime_daily: Number,
  job_description: String,
  free_hr_activities: String,
  travelling_hr: Number,
  weekend_mood: String,
  week_day_mood: String,
  free_hr_mrg: Number,
  free_hr_eve: Number,
  sleep_time: String,
  preferred_exercise: String,
  social_preference: String,
  energy_level_rating: Number,
  sleep_pattern: Number,
  hobbies: String,
  work_schedule: Number,
  meal_preferences: String,
  relaxation_methods: String,
}, { timestamps: true });

export default mongoose.model("UserProfile", userProfileSchema);
