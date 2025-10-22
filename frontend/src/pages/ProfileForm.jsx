import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ProfileForm() {
  const [form, setForm] = useState({
    screetime_daily: "",
    job_description: "",
    free_hr_activities: "",
    travelling_hr: "",
    weekend_mood: "",
    week_day_mood: "",
    free_hr_mrg: "",
    free_hr_eve: "",
    sleep_time: "",
    preferred_exercise: "",
    social_preference: "",
    energy_level_rating: "",
    sleep_pattern: "",
    hobbies: "",
    work_schedule: "",
    meal_preferences: "",
    relaxation_methods: "",
  });
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile saved successfully!");
      navigate("/mood");
    } catch (err) {
      alert("Error saving profile: " + err.message);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-[500px] max-h-screen overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">User Lifestyle Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Numeric Fields */}
        <div>
          <label className="block text-sm font-medium mb-1">Daily Screen Time (hours)</label>
          <input
            type="number"
            name="screetime_daily"
            value={form.screetime_daily}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            min="0"
            step="0.1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Travelling Time (minutes/day)</label>
          <input
            type="number"
            name="travelling_hr"
            value={form.travelling_hr}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Free Time (Morning - minutes)</label>
          <input
            type="number"
            name="free_hr_mrg"
            value={form.free_hr_mrg}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Free Time (Evening - minutes)</label>
          <input
            type="number"
            name="free_hr_eve"
            value={form.free_hr_eve}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sleep Pattern (hours/day)</label>
          <input
            type="number"
            name="sleep_pattern"
            value={form.sleep_pattern}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            min="0"
            step="0.1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Work Schedule (hours/day)</label>
          <input
            type="number"
            name="work_schedule"
            value={form.work_schedule}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Energy Level (1–10)</label>
          <input
            type="number"
            name="energy_level_rating"
            value={form.energy_level_rating}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            min="1"
            max="10"
            required
          />
        </div>

        {/* String Fields */}
        <div>
          <label className="block text-sm font-medium mb-1">Job Description</label>
          <input
            type="text"
            name="job_description"
            value={form.job_description}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Software Developer"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Free Hour Activities</label>
          <textarea
            name="free_hr_activities"
            value={form.free_hr_activities}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Reading, Music, Gardening"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Weekend Mood</label>
          <select
            name="weekend_mood"
            value={form.weekend_mood}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">Select</option>
            <option value="happy">Happy</option>
            <option value="relaxed">Relaxed</option>
            <option value="tired">Tired</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Weekday Mood</label>
          <select
            name="week_day_mood"
            value={form.week_day_mood}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">Select</option>
            <option value="stressed">Stressed</option>
            <option value="productive">Productive</option>
            <option value="calm">Calm</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sleep Time</label>
          <input
            type="time"
            name="sleep_time"
            value={form.sleep_time}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Preferred Exercise</label>
          <input
            type="text"
            name="preferred_exercise"
            value={form.preferred_exercise}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Yoga, Running, Gym"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Social Preference</label>
          <select
            name="social_preference"
            value={form.social_preference}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">Select</option>
            <option value="solo">Solo</option>
            <option value="group">Group</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hobbies</label>
          <textarea
            name="hobbies"
            value={form.hobbies}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Painting, Cycling, Movies"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Meal Preferences</label>
          <input
            type="text"
            name="meal_preferences"
            value={form.meal_preferences}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Vegetarian, Non-Vegetarian"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Relaxation Methods</label>
          <textarea
            name="relaxation_methods"
            value={form.relaxation_methods}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Meditation, Reading, Music"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}
