import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// A simple, non-blocking alert component
const CustomAlert = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-medium mb-4">Notification</h3>
        <p className="mb-4">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default function MoodEntry() {
  const navigate = useNavigate();
  const [moodText, setMoodText] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [recording, setRecording] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  useEffect(() => {
  if (!token) navigate("/login"); // redirect if token is missing
  }, [token, navigate]);


  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // optional
  navigate("/login"); // <-- SPA-friendly navigation // redirect to login page
  };
  // --- Custom Alert Handler ---
  const showAlert = (message) => {
    setAlertMessage(message);
  };

  // --- Audio Recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        setAudioBlob(new Blob(chunks, { type: "audio/webm" }));
        stream.getTracks().forEach((track) => track.stop()); // Stop audio track
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone: ", err);
      showAlert("Error accessing microphone: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  // --- Camera Capture ---

  // This effect handles starting and stopping the camera stream
  useEffect(() => {
    let stream = null;

    if (cameraOn) {
      const startStream = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } catch (err) {
          console.error("Error accessing camera: ", err);
          showAlert("Error accessing camera: " + err.message);
          setCameraOn(false); // Turn camera off if there's an error
        }
      };
      startStream();
    }

    // Cleanup function: This runs when `cameraOn` changes to false or on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [cameraOn]); // Re-run this effect whenever `cameraOn` changes

  const startCamera = () => {
    setCameraOn(true);
    setImageBlob(null); // Clear previous image
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => setImageBlob(blob), "image/jpeg");
    setCameraOn(false); // This will trigger the useEffect cleanup to stop the stream
  };

  const stopCamera = () => {
    setCameraOn(false); // This will trigger the useEffect cleanup
  };

  const retakeImage = () => startCamera();

  // --- Submit Mood ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!moodText.trim() || !audioBlob || !imageBlob) {
      showAlert("All three mood inputs (text, voice, and image) are required.");
      return;
    }

    if (!token) {
      showAlert("You are not logged in. Please log in to submit your mood.");
      return;
    }

    const formData = new FormData();
    formData.append("mood_text", moodText);
    formData.append("mood_audio", audioBlob, "audio.webm");
    formData.append("mood_image", imageBlob, "image.jpg");

    try {
      await axios.post("http://localhost:5000/api/mood", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      showAlert("Mood submitted successfully!");
      setMoodText("");
      setAudioBlob(null);
      setImageBlob(null);
      // No need to call stopCamera() here, it's already off
    } catch (err) {
      console.error("Error submitting mood: ", err);
      showAlert("Error submitting mood: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <>
      <CustomAlert message={alertMessage} onClose={() => setAlertMessage("")} />

        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Daily Mood Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Text Mood */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">How do you feel?</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              rows="3"
              value={moodText}
              onChange={(e) => setMoodText(e.target.value)}
              placeholder="Describe your mood..."
              required
            />
          </div>

          {/* Audio Mood */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Share your voice</label>
            {!recording ? (
              <button
                type="button"
                onClick={startRecording}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition w-full"
              >
                Start Recording
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full"
              >
                Stop Recording
              </button>
            )}
            {audioBlob && (
              <audio controls src={URL.createObjectURL(audioBlob)} className="mt-3 w-full" />
            )}
          </div>

          {/* Image Mood */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Capture your moment</label>

            {/* Camera Preview */}
            {cameraOn && !imageBlob && (
              <div className="mt-2">
                <video
                  ref={videoRef}
                  className="w-full border border-gray-300 rounded-lg bg-gray-100"
                  autoPlay
                  playsInline
                  muted // Muted to prevent audio feedback
                />
                <button
                  type="button"
                  onClick={captureImage}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-blue-600 transition w-full"
                >
                  Capture
                </button>
              </div>
            )}

            {/* Captured Image */}
            {imageBlob && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(imageBlob)}
                  alt="Captured mood"
                  className="w-full rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={retakeImage}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-yellow-600 transition w-full"
                >
                  Retake
                </button>
              </div>
            )}

            {/* Start Camera Button */}
            {!cameraOn && !imageBlob && (
              <button
                type="button"
                onClick={startCamera}
                className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-green-600 transition w-full"
              >
                Start Camera
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md"
          >
            Submit Mood
          </button>
        </form>
        <div className="flex justify-end mt-4">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold shadow-md"
        >
          Logout
        </button>
      </div>
      </div>
    </>
  );
}
