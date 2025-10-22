// ...existing code...
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileForm from "./pages/ProfileForm";
import MoodEntry from "./pages/MoodEntry";

function App() {
  // runtime check so routes reflect the latest token in localStorage
  const isLoggedIn = () => !!localStorage.getItem("token");

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Routes>
          <Route path="/" element={<Navigate to={isLoggedIn() ? "/mood" : "/login"} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={isLoggedIn() ? <ProfileForm /> : <Navigate to="/login" />} />
          <Route path="/mood" element={isLoggedIn() ? <MoodEntry /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
// ...existing code...