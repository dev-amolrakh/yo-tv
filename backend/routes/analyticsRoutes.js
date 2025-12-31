import express from "express";
import {
  trackVisit,
  trackChannelPlay,
  trackPageView,
  trackFavoriteAdd,
  getStats,
} from "../controllers/analyticsController.js";

const router = express.Router();

// Track visit
router.post("/visit", trackVisit);

// Track channel play
router.post("/channel-play", trackChannelPlay);

// Track page view
router.post("/page-view", trackPageView);

// Track favorite add
router.post("/favorite-add", trackFavoriteAdd);

// Get analytics stats (admin)
router.get("/stats", getStats);

export default router;
