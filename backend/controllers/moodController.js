import MoodEntry from "../models/moodentry.js";
import path from "path";
import fs from "fs";

export const uploadMood = async (req, res) => {
  try {
    const { mood_text } = req.body;
    const userId = req.user._id;

    const mood_audio = req.files?.mood_audio?.[0]?.filename || null;
    const mood_image = req.files?.mood_image?.[0]?.filename || null;

    const mood = await MoodEntry.create({
      user: userId,
      mood_text,
      mood_audio,
      mood_image,
    });

    res.status(201).json({ message: "Mood entry saved", mood });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
