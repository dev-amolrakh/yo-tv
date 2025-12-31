import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  Play,
  Heart,
  TrendingUp,
  Calendar,
  BarChart3,
  Activity,
  Tv,
  ArrowLeft,
  RefreshCw,
  Clock,
  Eye,
  MessageSquare,
  Mail,
  Trash2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Loading from "../components/Loading";
import {
  getAdminAnalytics,
  getAdminFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} from "../services/api";

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackMeta, setFeedbackMeta] = useState({ total: 0, newCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const navigate = useNavigate();

  const password = sessionStorage.getItem("adminPassword");

  useEffect(() => {
    if (!password) {
      navigate("/admin");
      return;
    }
    fetchData();
  }, [password, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, feedbackResponse] = await Promise.all([
        getAdminAnalytics(password),
        getAdminFeedback(password, feedbackFilter),
      ]);
      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }
      if (feedbackResponse.success) {
        setFeedbacks(feedbackResponse.data);
        setFeedbackMeta(feedbackResponse.meta);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 401) {
        sessionStorage.removeItem("adminPassword");
        navigate("/admin");
      } else {
        setError("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await getAdminFeedback(password, feedbackFilter);
      if (response.success) {
        setFeedbacks(response.data);
        setFeedbackMeta(response.meta);
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };

  useEffect(() => {
    if (password) {
      fetchFeedback();
    }
  }, [feedbackFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleFeedbackStatusUpdate = async (id, status) => {
    try {
      await updateFeedbackStatus(id, password, status);
      await fetchFeedback();
    } catch (err) {
      console.error("Error updating feedback:", err);
    }
  };

  const handleFeedbackDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await deleteFeedback(id, password);
        await fetchFeedback();
        setExpandedFeedback(null);
      } catch (err) {
        console.error("Error deleting feedback:", err);
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminPassword");
    navigate("/admin");
  };

  if (loading) {
    return <Loading message="Loading analytics..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    overview,
    topPlayedChannels,
    topFavoritedChannels,
    dailyVisitors,
    dailyPlays,
    categoryBreakdown,
    recentActivity,
  } = analytics || {};

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 bg-dark-300 hover:bg-dark-400 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-primary-500" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Real-time platform insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-dark-300 hover:bg-dark-400 rounded-lg transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-200 rounded-xl p-4 sm:p-6 border border-dark-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-400 text-sm">Today's Visitors</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {overview?.todayVisitors || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Unique visitors today</p>
        </div>

        <div className="bg-dark-200 rounded-xl p-4 sm:p-6 border border-dark-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-gray-400 text-sm">Total Visitors</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {overview?.totalVisitors || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">All time unique</p>
        </div>

        <div className="bg-dark-200 rounded-xl p-4 sm:p-6 border border-dark-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Play className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Today's Plays</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {overview?.todayPlays || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Channel plays today</p>
        </div>

        <div className="bg-dark-200 rounded-xl p-4 sm:p-6 border border-dark-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-gray-400 text-sm">Total Plays</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {overview?.totalPlays || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">All time plays</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-200 rounded-xl p-4 border border-dark-300">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Calendar className="w-4 h-4" />
            This Week
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">
              {overview?.weekVisitors || 0}
            </span>
            <span className="text-gray-500 text-sm">visitors</span>
          </div>
        </div>
        <div className="bg-dark-200 rounded-xl p-4 border border-dark-300">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Eye className="w-4 h-4" />
            This Month
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">
              {overview?.monthVisitors || 0}
            </span>
            <span className="text-gray-500 text-sm">visitors</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Visitors Chart */}
        <div className="bg-dark-200 rounded-xl p-4 sm:p-6 border border-dark-300">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Daily Visitors (Last 30 Days)
          </h3>
          <div className="h-48 flex items-end gap-1 overflow-x-auto pb-2">
            {dailyVisitors?.length > 0 ? (
              dailyVisitors.map((day, idx) => {
                const maxVisitors = Math.max(
                  ...dailyVisitors.map((d) => d.uniqueVisitors)
                );
                const height =
                  maxVisitors > 0
                    ? (day.uniqueVisitors / maxVisitors) * 100
                    : 0;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center min-w-[20px]"
                  >
                    <span className="text-xs text-gray-400 mb-1">
                      {day.uniqueVisitors}
                    </span>
                    <div
                      className="w-4 sm:w-6 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-500 hover:to-blue-300"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${formatDate(day._id)}: ${
                        day.uniqueVisitors
                      } visitors`}
                    />
                    <span className="text-[10px] text-gray-500 mt-1 rotate-45 origin-left">
                      {formatDate(day._id)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Daily Plays Chart */}
        <div className="bg-dark-200 rounded-xl p-4 sm:p-6 border border-dark-300">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-400" />
            Daily Channel Plays (Last 30 Days)
          </h3>
          <div className="h-48 flex items-end gap-1 overflow-x-auto pb-2">
            {dailyPlays?.length > 0 ? (
              dailyPlays.map((day, idx) => {
                const maxPlays = Math.max(...dailyPlays.map((d) => d.plays));
                const height = maxPlays > 0 ? (day.plays / maxPlays) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center min-w-[20px]"
                  >
                    <span className="text-xs text-gray-400 mb-1">
                      {day.plays}
                    </span>
                    <div
                      className="w-4 sm:w-6 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all hover:from-purple-500 hover:to-purple-300"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${formatDate(day._id)}: ${day.plays} plays`}
                    />
                    <span className="text-[10px] text-gray-500 mt-1 rotate-45 origin-left">
                      {formatDate(day._id)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Channels Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Most Played Channels */}
        <div className="bg-dark-200 rounded-xl p-4 sm:p-6 border border-dark-300">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-green-400" />
            Most Played Channels
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {topPlayedChannels?.length > 0 ? (
              topPlayedChannels.map((channel, idx) => (
                <div
                  key={channel._id}
                  className="flex items-center gap-3 p-3 bg-dark-300 rounded-lg"
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-dark-400 rounded-full text-sm font-bold text-gray-400">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {channel.channelName || channel._id}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {channel.category || "General"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">
                      {channel.playCount}
                    </p>
                    <p className="text-xs text-gray-500">plays</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No channel plays yet
              </p>
            )}
          </div>
        </div>

        {/* Most Favorited Channels */}
        <div className="bg-dark-200 rounded-xl p-4 sm:p-6 border border-dark-300">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400 fill-red-400" />
            Most Favorited Channels
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {topFavoritedChannels?.length > 0 ? (
              topFavoritedChannels.map((channel, idx) => (
                <div
                  key={channel._id}
                  className="flex items-center gap-3 p-3 bg-dark-300 rounded-lg"
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-dark-400 rounded-full text-sm font-bold text-gray-400">
                    #{idx + 1}
                  </span>
                  <div className="w-10 h-10 bg-dark-400 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.channelName}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <Tv className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {channel.channelName || channel._id}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {channel.category || "General"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-400">
                      {channel.favoriteCount}
                    </p>
                    <p className="text-xs text-gray-500">favorites</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No favorites yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-dark-200 rounded-xl p-4 sm:p-6 border border-dark-300">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            Category Breakdown
          </h3>
          <div className="space-y-3">
            {categoryBreakdown?.length > 0 ? (
              categoryBreakdown.slice(0, 10).map((cat) => {
                const maxCount = categoryBreakdown[0]?.count || 1;
                const percentage = (cat.count / maxCount) * 100;
                return (
                  <div key={cat._id || "unknown"} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300 capitalize">
                        {cat._id || "Unknown"}
                      </span>
                      <span className="text-gray-500">{cat.count} plays</span>
                    </div>
                    <div className="h-2 bg-dark-400 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">
                No category data yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-dark-200 rounded-xl p-4 sm:p-6 border border-dark-300">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Recent Activity
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentActivity?.length > 0 ? (
              recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 hover:bg-dark-300 rounded-lg transition-colors"
                >
                  <div
                    className={`p-1.5 rounded-lg ${
                      activity.type === "channel_play"
                        ? "bg-green-500/20"
                        : "bg-red-500/20"
                    }`}
                  >
                    {activity.type === "channel_play" ? (
                      <Play className="w-4 h-4 text-green-400" />
                    ) : (
                      <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {activity.data?.channelName || "Unknown Channel"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.type === "channel_play"
                        ? "Played"
                        : "Favorited"}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>

      {/* User Feedback Section */}
      <div className="bg-dark-200 rounded-xl p-4 sm:p-6 border border-dark-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-400" />
            User Feedback
            {feedbackMeta.newCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {feedbackMeta.newCount} new
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filter:</span>
            <select
              value={feedbackFilter}
              onChange={(e) => setFeedbackFilter(e.target.value)}
              className="px-3 py-1.5 bg-dark-300 border border-dark-400 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All ({feedbackMeta.total})</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {feedbacks?.length > 0 ? (
            feedbacks.map((feedback) => (
              <div
                key={feedback._id}
                className={`bg-dark-300 rounded-xl border transition-all ${
                  feedback.status === "new"
                    ? "border-primary-500/50"
                    : "border-dark-400"
                }`}
              >
                {/* Feedback Header */}
                <button
                  onClick={() =>
                    setExpandedFeedback(
                      expandedFeedback === feedback._id ? null : feedback._id
                    )
                  }
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
                      feedback.status === "new"
                        ? "bg-primary-500/20"
                        : feedback.status === "resolved"
                        ? "bg-green-500/20"
                        : "bg-dark-400"
                    }`}
                  >
                    <Mail
                      className={`w-4 h-4 ${
                        feedback.status === "new"
                          ? "text-primary-400"
                          : feedback.status === "resolved"
                          ? "text-green-400"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-white truncate">
                        {feedback.subject}
                      </p>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-full capitalize ${
                          feedback.type === "bug"
                            ? "bg-red-500/20 text-red-400"
                            : feedback.type === "suggestion"
                            ? "bg-blue-500/20 text-blue-400"
                            : feedback.type === "question"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {feedback.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {feedback.name} • {feedback.email} •{" "}
                      {formatTime(feedback.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-lg capitalize ${
                        feedback.status === "new"
                          ? "bg-primary-500/20 text-primary-400"
                          : feedback.status === "read"
                          ? "bg-blue-500/20 text-blue-400"
                          : feedback.status === "replied"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {feedback.status}
                    </span>
                    {expandedFeedback === feedback._id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedFeedback === feedback._id && (
                  <div className="px-4 pb-4 border-t border-dark-400">
                    <div className="mt-4 p-3 bg-dark-400/50 rounded-lg">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {feedback.message}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500 mr-2">
                        Mark as:
                      </span>
                      {["new", "read", "replied", "resolved"].map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            handleFeedbackStatusUpdate(feedback._id, status)
                          }
                          disabled={feedback.status === status}
                          className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
                            feedback.status === status
                              ? "bg-primary-500 text-white cursor-not-allowed"
                              : "bg-dark-400 text-gray-300 hover:bg-dark-500"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                      <button
                        onClick={() => handleFeedbackDelete(feedback._id)}
                        className="ml-auto px-3 py-1 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-dark-400 mx-auto mb-3" />
              <p className="text-gray-500">No feedback yet</p>
              <p className="text-gray-600 text-sm mt-1">
                User feedback will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
