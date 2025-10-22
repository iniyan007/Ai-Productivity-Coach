import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Login request
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Check if profile exists
      try {
        const profileRes = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${data.token}` },
        });

        // Profile exists → redirect to mood page
        navigate("/mood");
      } catch (err) {
        // If 404, profile not found → redirect to profile page
        if (err.response?.status === 404) {
          navigate("/profile");
        } else {
          // Other errors
          setError("Error checking profile: " + err.message);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-8 w-96 mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          required
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
        >
          Login
        </button>
      </form>
      <p className="text-sm text-center mt-4">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-indigo-600 font-medium">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
