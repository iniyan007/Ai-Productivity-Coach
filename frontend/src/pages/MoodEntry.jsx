import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// simple modal/alert kept as-is (visual only)
const CustomAlert = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Notification</h3>
        <p className="text-sm text-gray-700 mb-5">{message}</p>
        <button
          onClick={onClose}
          className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 transition"
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
  const [token] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  useEffect(() => {
    const checkAuth = async () => {
      const t = localStorage.getItem("token");
      if (!t) return navigate("/login");
      try {
        const res = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.data) navigate("/profile");
      } catch {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const showAlert = (message) => setAlertMessage(message);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        setAudioBlob(new Blob(chunks, { type: "audio/webm" }));
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      showAlert("Unable to access microphone. Check permissions.");
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRecording(false);
    }
  };

  useEffect(() => {
    let stream = null;
    if (cameraOn) {
      (async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // play() might be blocked; ignore the returned promise
            try { videoRef.current.play(); } catch {}
          }
        } catch (err) {
          console.error(err);
          showAlert("Unable to access camera. Check permissions.");
          setCameraOn(false);
        }
      })();
    }

    return () => {
      try {
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach((t) => t.stop());
          videoRef.current.srcObject = null;
        }
      } catch (e) {
        /* ignore cleanup errors */
      }
    };
  }, [cameraOn]);

  const startCamera = () => {
    setCameraOn(true);
    setImageBlob(null);
  };

  const captureImage = () => {
    if (!videoRef.current) {
      showAlert("Camera preview not available.");
      return;
    }
    const vw = videoRef.current.videoWidth || 640;
    const vh = videoRef.current.videoHeight || 480;
    const canvas = document.createElement("canvas");
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) setImageBlob(blob);
    }, "image/jpeg", 0.9);
    setCameraOn(false);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    } catch (e) {
      /* ignore */
    }
  };

  const retakeImage = () => startCamera();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!moodText.trim() || !audioBlob || !imageBlob) {
      showAlert("Please provide text, voice, and a photo before submitting.");
      return;
    }
    if (!token) {
      showAlert("You are not authenticated. Please sign in.");
      return;
    }

    const formData = new FormData();
    formData.append("mood_text", moodText);
    formData.append("mood_audio", audioBlob, "audio.webm");
    formData.append("mood_image", imageBlob, "image.jpg");

    try {
      await axios.post("http://localhost:5000/api/mood", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      showAlert("Mood submitted successfully.");
      setMoodText("");
      setAudioBlob(null);
      setImageBlob(null);
    } catch (err) {
      console.error(err);
      showAlert("Submission failed. Please try again.");
    }
  };

  return (
    <>
      <CustomAlert message={alertMessage} onClose={() => setAlertMessage("")} />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
          <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">AI Productivity Coach</h1>
              <p className="text-sm text-gray-500">Daily mood entry</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:shadow"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Share your mood</h2>
                <p className="text-sm text-gray-500">Write a quick note, record a short voice clip and take a photo.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 bg-white">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How are you feeling?</label>
                  <textarea
                    value={moodText}
                    onChange={(e) => setMoodText(e.target.value)}
                    rows={4}
                    placeholder="A short note about your mood..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Voice note</label>
                    <div className="flex flex-col gap-3">
                      {!recording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          Start recording
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Stop recording
                        </button>
                      )}

                      {audioBlob && <audio controls src={URL.createObjectURL(audioBlob)} className="w-full mt-2" />}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                    <div className="flex flex-col gap-3">
                      {cameraOn && !imageBlob && (
                        <div className="rounded-lg overflow-hidden border border-gray-200">
                          <video ref={videoRef} className="w-full h-52 bg-black object-cover" autoPlay playsInline muted />
                          <div className="p-3 bg-gray-50">
                            <button
                              type="button"
                              onClick={captureImage}
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                              Capture
                            </button>
                          </div>
                        </div>
                      )}

                      {imageBlob && (
                        <div className="rounded-lg overflow-hidden border border-gray-200">
                          <img src={URL.createObjectURL(imageBlob)} alt="Captured" className="w-full h-52 object-cover" />
                          <div className="p-3 bg-gray-50 flex gap-3">
                            <button
                              type="button"
                              onClick={retakeImage}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                            >
                              Retake
                            </button>
                            <button
                              type="button"
                              onClick={() => setImageBlob(null)}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}

                      {!cameraOn && !imageBlob && (
                        <button
                          type="button"
                          onClick={startCamera}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                          Start Camera
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold shadow"
                  >
                    Submit Mood
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/mood")}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>

            <aside className="hidden lg:block bg-gray-50 rounded-lg p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tips</h3>
              <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                <li>Keep the note concise — 1–3 sentences</li>
                <li>Record a short voice clip (10–30s)</li>
                <li>Use natural light for photos</li>
              </ul>

              <div className="mt-6">
                <h4 className="text-sm text-gray-700 mb-2">Attachments</h4>
                <div className="text-sm text-gray-600">
                  <div>Audio: {audioBlob ? <span className="text-green-600 font-medium">Ready</span> : <span className="text-gray-400">None</span>}</div>
                  <div className="mt-1">Photo: {imageBlob ? <span className="text-green-600 font-medium">Ready</span> : <span className="text-gray-400">None</span>}</div>
                </div>
              </div>
            </aside>
          </main>

          <footer className="px-6 py-4 border-t border-gray-100 text-sm text-gray-500">
            Submissions are private and used to improve your personalized suggestions.
          </footer>
        </div>
      </div>
    </>
  );
}