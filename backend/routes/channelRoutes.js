import express from "express";
import {
  getAllChannels,
  getIndianChannels,
  getChannelById,
  getCategories,
  getIndianStreams,
  getLanguages,
  getRelatedChannels,
} from "../controllers/channelController.js";

const router = express.Router();

// Get all channels
router.get("/", getAllChannels);

// Get Indian channels only
router.get("/india", getIndianChannels);

// Get categories
router.get("/categories", getCategories);

// Get languages
router.get("/languages", getLanguages);

// Get Indian streams
router.get("/india/streams", getIndianStreams);

// Get related channels
router.get("/related/:channelId", getRelatedChannels);

// Get channel by ID
router.get("/:id", getChannelById);

export default router;
