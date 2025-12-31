import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxLength: 255,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxLength: 2000,
  },
  type: {
    type: String,
    enum: ["feedback", "suggestion", "bug", "question", "other"],
    default: "feedback",
  },
  status: {
    type: String,
    enum: ["new", "read", "replied", "resolved"],
    default: "new",
  },
  visitorId: {
    type: String,
    index: true,
  },
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Index for efficient queries
feedbackSchema.index({ status: 1, createdAt: -1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
