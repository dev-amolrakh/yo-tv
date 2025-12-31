import express from "express";
import {
  verifyPassword,
  getAnalytics,
} from "../controllers/adminController.js";

const router = express.Router();

// Verify admin password
router.post("/verify", verifyPassword);

// Get analytics data (requires password in query)
router.get("/analytics", getAnalytics);

export default router;
