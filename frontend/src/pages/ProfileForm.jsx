import { useState, useEffect } from "react";
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
    energy_level_rating: 5,
    sleep_pattern: "",
    hobbies: "",
    work_schedule: "",
    meal_preferences: "",
    relaxation_methods: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return navigate("/login");

    const getProfile = async () => {
      try {
        setFetching(true);
        const res = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          // if controller returns wrapper like { profile } handle accordingly
          const profile = res.data.profile || res.data;
          setForm((prev) => ({ ...prev, ...profile }));
        }
      } catch (err) {
        // if 404, allow user to fill the form; otherwise show error
        if (err.response?.status !== 404) {
          setError("Failed to load profile. " + (err.response?.data?.message || err.message));
        }
      } finally {
        setFetching(false);
      }
    };

    getProfile();
  }, [navigate, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    // basic validation example
    if (!form.job_description.trim()) return "Please enter your job description.";
    if (form.screetime_daily === "" || Number(form.screetime_daily) < 0) return "Enter a valid daily screen time.";
    if (Number(form.energy_level_rating) < 1 || Number(form.energy_level_rating) > 10) return "Energy rating must be 1–10.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    if (!token) {
      setError("You must be logged in to save your profile.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data?.message || "Profile saved successfully!");
      setTimeout(() => setMessage(""), 3000);
      // navigate to mood after saving
      navigate("/mood");
    } catch (err) {
      setError("Error saving profile: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Branding / Illustration */}
          <div className="hidden lg:flex flex-col items-center justify-center bg-indigo-700 text-white p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-10 p-3 rounded-lg">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Ai Productivity Coach</h3>
                <p className="text-sm text-indigo-200">Personalize your experience</p>
              </div>
            </div>
            <p className="text-sm text-indigo-100 text-center">Share a few details about your routine so the coach can give tailored suggestions.</p>
            <img src="https://images.unsplash.com/photo-1526378727447-6d7f6f8d3a4e?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=1b2efe9b8b1f6a2e2b3e5c5a7c9e2a9d" alt="profile" className="rounded-xl object-cover w-full h-40 opacity-90" />
          </div>

          {/* Form */}
          <div className="lg:col-span-2 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Your Lifestyle Profile</h2>
                <p className="text-sm text-gray-500">A few details to personalize recommendations</p>
              </div>
              <div className="text-right">
                {fetching ? (
                  <div className="text-sm text-gray-400">Loading...</div>
                ) : (
                  <div className="text-sm text-green-600">{form._id ? "Profile loaded" : "New profile"}</div>
                )}
              </div>
            </div>

            {message && <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-100 p-3 rounded">{message}</div>}
            {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6 max-h-[68vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Screen Time (hours)</label>
                  <input
                    type="number"
                    name="screetime_daily"
                    value={form.screetime_daily}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Travelling Time (minutes/day)</label>
                  <input
                    type="number"
                    name="travelling_hr"
                    value={form.travelling_hr}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Free Time (Morning - minutes)</label>
                  <input
                    type="number"
                    name="free_hr_mrg"
                    value={form.free_hr_mrg}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Free Time (Evening - minutes)</label>
                  <input
                    type="number"
                    name="free_hr_eve"
                    value={form.free_hr_eve}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Pattern (hours/day)</label>
                  <input
                    type="number"
                    name="sleep_pattern"
                    value={form.sleep_pattern}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Schedule (hours/day)</label>
                  <input
                    type="number"
                    name="work_schedule"
                    value={form.work_schedule}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                  <input
                    type="text"
                    name="job_description"
                    value={form.job_description}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    placeholder="e.g. Software Developer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Exercise</label>
                  <input
                    type="text"
                    name="preferred_exercise"
                    value={form.preferred_exercise}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    placeholder="e.g. Yoga, Running"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Free Hour Activities</label>
                  <textarea
                    name="free_hr_activities"
                    value={form.free_hr_activities}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    placeholder="e.g. Reading, Music, Gardening"
                    rows="2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hobbies</label>
                  <input
                    type="text"
                    name="hobbies"
                    value={form.hobbies}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    placeholder="e.g. Painting, Cycling"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Preferences</label>
                  <input
                    type="text"
                    name="meal_preferences"
                    value={form.meal_preferences}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    placeholder="e.g. Vegetarian"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relaxation Methods</label>
                  <textarea
                    name="relaxation_methods"
                    value={form.relaxation_methods}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    placeholder="e.g. Meditation, Reading"
                    rows="2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weekend Mood</label>
                  <select
                    name="weekend_mood"
                    value={form.weekend_mood}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weekday Mood</label>
                  <select
                    name="week_day_mood"
                    value={form.week_day_mood}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Social Preference</label>
                  <select
                    name="social_preference"
                    value={form.social_preference}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select</option>
                    <option value="solo">Solo</option>
                    <option value="group">Group</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Time</label>
                  <input
                    type="time"
                    name="sleep_time"
                    value={form.sleep_time}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Energy Level ({form.energy_level_rating})</label>
                  <input
                    type="range"
                    name="energy_level_rating"
                    value={form.energy_level_rating}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold shadow ${loading ? "opacity-80 cursor-wait" : ""}`}
                >
                  {loading ? "Saving..." : "Save & Continue"}
                </button>
                
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}