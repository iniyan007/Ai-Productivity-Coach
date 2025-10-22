import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs"; // <-- 1. Import the File System module
import { uploadMood } from "../controllers/moodController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Proactive Directory Creation ---
const uploadDir = "uploads/";
// Check if the upload directory exists, and create it if it doesn't
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// ---

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // <-- 2. Use the variable
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // This line needs 'path' to work
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Route: POST /api/mood
router.post(
  "/",
  protect,
  upload.fields([
    { name: "mood_audio", maxCount: 1 },
    { name: "mood_image", maxCount: 1 },
  ]),
  uploadMood
);

export default router;

