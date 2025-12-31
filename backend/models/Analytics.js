import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      "visit",
      "channel_play",
      "page_view",
      "favorite_add",
      "favorite_remove",
    ],
    required: true,
  },
  data: {
    channelId: String,
    channelName: String,
    category: String,
    logo: String,
    page: String,
    referrer: String,
    userAgent: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD for easy grouping
    index: true,
  },
});

// Create compound indexes for efficient queries
analyticsSchema.index({ type: 1, date: 1 });
analyticsSchema.index({ visitorId: 1, type: 1 });

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;
