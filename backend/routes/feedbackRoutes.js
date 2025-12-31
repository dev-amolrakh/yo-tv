import express from "express";
import Feedback from "../models/Feedback.js";

const router = express.Router();

// Admin password (same as adminController)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "#Amol@22";

// Submit feedback
router.post("/submit", async (req, res) => {
  try {
    const { name, email, subject, message, type, visitorId } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Create feedback
    const feedback = new Feedback({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      type: type || "feedback",
      visitorId,
      userAgent: req.headers["user-agent"],
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: "Thank you for your feedback! We appreciate your input.",
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback. Please try again.",
    });
  }
});

// Get all feedback (admin only)
router.get("/all", async (req, res) => {
  try {
    const { password, status, limit = 50 } = req.query;

    // Simple password protection
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const totalCount = await Feedback.countDocuments();
    const newCount = await Feedback.countDocuments({ status: "new" });

    res.json({
      success: true,
      data: feedbacks,
      meta: {
        total: totalCount,
        newCount,
        returned: feedbacks.length,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
    });
  }
});

// Update feedback status (admin only)
router.patch("/:id/status", async (req, res) => {
  try {
    const { password, status } = req.body;

    // Simple password protection
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const validStatuses = ["new", "read", "replied", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update feedback",
    });
  }
});

// Delete feedback (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const { password } = req.query;

    // Simple password protection
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete feedback",
    });
  }
});

export default router;
