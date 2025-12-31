import Analytics from "../models/Analytics.js";

// Get today's date string
const getTodayString = () => {
  return new Date().toISOString().split("T")[0];
};

// Track a visit (unique visitor)
export const trackVisit = async (req, res) => {
  try {
    const { visitorId } = req.body;

    if (!visitorId) {
      return res
        .status(400)
        .json({ success: false, message: "Visitor ID required" });
    }

    const today = getTodayString();

    // Check if this visitor already visited today
    const existingVisit = await Analytics.findOne({
      visitorId,
      type: "visit",
      date: today,
    });

    if (!existingVisit) {
      // New visit for today
      await Analytics.create({
        visitorId,
        type: "visit",
        data: {
          userAgent: req.headers["user-agent"],
          referrer: req.headers.referer || req.headers.referrer || null,
        },
        date: today,
      });
    }

    res.json({ success: true, message: "Visit tracked" });
  } catch (error) {
    console.error("Error tracking visit:", error);
    res.status(500).json({ success: false, message: "Failed to track visit" });
  }
};

// Track channel play
export const trackChannelPlay = async (req, res) => {
  try {
    const { visitorId, channelId, channelName, category } = req.body;

    if (!visitorId || !channelId) {
      return res.status(400).json({
        success: false,
        message: "Visitor ID and Channel ID required",
      });
    }

    const today = getTodayString();

    await Analytics.create({
      visitorId,
      type: "channel_play",
      data: {
        channelId,
        channelName,
        category,
      },
      date: today,
    });

    res.json({ success: true, message: "Channel play tracked" });
  } catch (error) {
    console.error("Error tracking channel play:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to track channel play" });
  }
};

// Track page view
export const trackPageView = async (req, res) => {
  try {
    const { visitorId, page } = req.body;

    if (!visitorId || !page) {
      return res
        .status(400)
        .json({ success: false, message: "Visitor ID and page required" });
    }

    const today = getTodayString();

    await Analytics.create({
      visitorId,
      type: "page_view",
      data: {
        page,
        userAgent: req.headers["user-agent"],
      },
      date: today,
    });

    res.json({ success: true, message: "Page view tracked" });
  } catch (error) {
    console.error("Error tracking page view:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to track page view" });
  }
};

// Track favorite add
export const trackFavoriteAdd = async (req, res) => {
  try {
    const { visitorId, channelId, channelName, category, logo } = req.body;

    if (!visitorId || !channelId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Visitor ID and Channel ID required",
        });
    }

    const today = getTodayString();

    await Analytics.create({
      visitorId,
      type: "favorite_add",
      data: {
        channelId,
        channelName,
        category,
        logo,
      },
      date: today,
    });

    res.json({ success: true, message: "Favorite tracked" });
  } catch (error) {
    console.error("Error tracking favorite:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to track favorite" });
  }
};

// Get analytics stats (admin endpoint)
export const getStats = async (req, res) => {
  try {
    const today = getTodayString();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoString = sevenDaysAgo.toISOString().split("T")[0];

    // Today's unique visitors
    const todayVisitors = await Analytics.distinct("visitorId", {
      type: "visit",
      date: today,
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

    // Total channel plays (all time)
    const totalPlays = await Analytics.countDocuments({
      type: "channel_play",
    });

    // Most played channels (last 7 days)
    const topChannels = await Analytics.aggregate([
      {
        $match: {
          type: "channel_play",
          date: { $gte: sevenDaysAgoString },
        },
      },
      {
        $group: {
          _id: "$data.channelId",
          channelName: { $first: "$data.channelName" },
          playCount: { $sum: 1 },
        },
      },
      { $sort: { playCount: -1 } },
      { $limit: 10 },
    ]);

    // Daily visitors for last 7 days
    const dailyVisitors = await Analytics.aggregate([
      {
        $match: {
          type: "visit",
          date: { $gte: sevenDaysAgoString },
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

    res.json({
      success: true,
      data: {
        todayVisitors: todayVisitors.length,
        totalVisitors: totalVisitors.length,
        todayPlays,
        totalPlays,
        topChannels,
        dailyVisitors,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};
