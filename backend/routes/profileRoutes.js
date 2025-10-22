import express from "express";
import { saveUserProfile, getUserProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, saveUserProfile);
router.get("/", protect, getUserProfile);

export default router;
