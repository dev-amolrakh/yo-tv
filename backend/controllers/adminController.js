import Analytics from "../models/Analytics.js";

// Admin password (in production, use environment variable)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "#Amol@22";

// Verify admin password
export const verifyPassword = (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: "Access granted" });
  } else {
    res.status(401).json({ success: false, message: "Invalid password" });
  }
};

// Get today's date string
const getTodayString = () => {
  return new Date().toISOString().split("T")[0];
};

// Get comprehensive analytics
export const getAnalytics = async (req, res) => {
  try {
    const { password } = req.query;

    // Verify password
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const today = getTodayString();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoString = sevenDaysAgo.toISOString().split("T")[0];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoString = thirtyDaysAgo.toISOString().split("T")[0];

    // Today's unique visitors
    const todayVisitors = await Analytics.distinct("visitorId", {
      type: "visit",
      date: today,
    });

    // This week's unique visitors
    const weekVisitors = await Analytics.distinct("visitorId", {
      type: "visit",
      date: { $gte: sevenDaysAgoString },
    });

    // This month's unique visitors
    const monthVisitors = await Analytics.distinct("visitorId", {
      type: "visit",
      date: { $gte: thirtyDaysAgoString },
    });

    // Total unique visitors (all time)
    const totalVisitors = await Analytics.distinct("visitorId", {
      type: "visit",
    });

    // Today's channel plays
    const todayPlays = await Analytics.countDocuments({
      type: "channel_play",
      date: today,
    });

    // This week's channel plays
    const weekPlays = await Analytics.countDocuments({
      type: "channel_play",
      date: { $gte: sevenDaysAgoString },
    });

    // Total channel plays (all time)
    const totalPlays = await Analytics.countDocuments({
      type: "channel_play",
    });

    // Most played channels (all time - top 15)
    const topPlayedChannels = await Analytics.aggregate([
      { $match: { type: "channel_play" } },
      {
        $group: {
          _id: "$data.channelId",
          channelName: { $first: "$data.channelName" },
          category: { $first: "$data.category" },
          playCount: { $sum: 1 },
          lastPlayed: { $max: "$timestamp" },
        },
      },
      { $sort: { playCount: -1 } },
      { $limit: 15 },
    ]);

    // Most favorited channels (all time - top 15)
    const topFavoritedChannels = await Analytics.aggregate([
      { $match: { type: "favorite_add" } },
      {
        $group: {
          _id: "$data.channelId",
          channelName: { $first: "$data.channelName" },
          category: { $first: "$data.category" },
          logo: { $first: "$data.logo" },
          favoriteCount: { $sum: 1 },
        },
      },
      { $sort: { favoriteCount: -1 } },
      { $limit: 15 },
    ]);

    // Daily visitors for last 30 days
    const dailyVisitors = await Analytics.aggregate([
      {
        $match: {
          type: "visit",
          date: { $gte: thirtyDaysAgoString },
        },
      },
      {
        $group: {
          _id: { date: "$date", visitorId: "$visitorId" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          uniqueVisitors: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Daily channel plays for last 30 days
    const dailyPlays = await Analytics.aggregate([
      {
        $match: {
          type: "channel_play",
          date: { $gte: thirtyDaysAgoString },
        },
      },
      {
        $group: {
          _id: "$date",
          plays: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Category breakdown
    const categoryBreakdown = await Analytics.aggregate([
      { $match: { type: "channel_play" } },
      {
        $group: {
          _id: "$data.category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent activity (last 50 events)
    const recentActivity = await Analytics.find({
      type: { $in: ["channel_play", "favorite_add"] },
    })
      .sort({ timestamp: -1 })
      .limit(50)
      .select("type data timestamp");

    res.json({
      success: true,
      data: {
        overview: {
          todayVisitors: todayVisitors.length,
          weekVisitors: weekVisitors.length,
          monthVisitors: monthVisitors.length,
          totalVisitors: totalVisitors.length,
          todayPlays,
          weekPlays,
          totalPlays,
        },
        topPlayedChannels,
        topFavoritedChannels,
        dailyVisitors,
        dailyPlays,
        categoryBreakdown,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch analytics" });
  }
};
