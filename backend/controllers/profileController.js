import UserProfile from "../models/UserProfile.js";

export const saveUserProfile = async (req, res) => {
  try {
    const existingProfile = await UserProfile.findOne({ user: req.user._id });

    if (existingProfile) {
      // Update if already exists
      const updated = await UserProfile.findOneAndUpdate(
        { user: req.user._id },
        req.body,
        { new: true }
      );
      return res.json({ message: "Profile updated successfully", updated });
    }

    const profile = new UserProfile({ ...req.body, user: req.user._id });
    await profile.save();
    res.status(201).json({ message: "Profile saved successfully", profile });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile)
      return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
