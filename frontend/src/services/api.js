import axios from "axios";
import * as favoritesService from "./favorites.js";

const API_URL = "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Generate or get visitor ID for analytics
const getVisitorId = () => {
  let visitorId = localStorage.getItem("visitorId");
  if (!visitorId) {
    visitorId =
      "visitor_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("visitorId", visitorId);
  }
  return visitorId;
};

// Channel API calls
export const getIndianChannels = async (params = {}) => {
  const response = await api.get("/channels/india", { params });
  return response.data;
};

export const getChannelById = async (id) => {
  const response = await api.get(`/channels/${id}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/channels/categories");
  return response.data;
};

export const getLanguages = async () => {
  const response = await api.get("/channels/languages");
  return response.data;
};

export const getRelatedChannels = async (channelId) => {
  const response = await api.get(`/channels/related/${channelId}`);
  return response.data;
};

// Favorites - localStorage based (no server calls)
export const getFavorites = () => {
  return { success: true, data: favoritesService.getFavorites() };
};

export const addToFavorites = (channel) => {
  const added = favoritesService.addToFavorites(channel);
  if (added) {
    // Track favorite add for analytics
    trackFavoriteAdd(channel);
  }
  return {
    success: added,
    message: added ? "Added to favorites" : "Already in favorites",
  };
};

export const removeFromFavorites = (channelId) => {
  const removed = favoritesService.removeFromFavorites(channelId);
  return {
    success: removed,
    message: removed ? "Removed from favorites" : "Not found in favorites",
  };
};

export const checkIsFavorite = (channelId) => {
  return { success: true, isFavorite: favoritesService.isFavorite(channelId) };
};

export const getFavoritesCount = () => {
  return favoritesService.getFavoritesCount();
};

// Analytics API calls
export const trackVisit = async () => {
  try {
    const visitorId = getVisitorId();
    await api.post("/analytics/visit", { visitorId });
  } catch (error) {
    console.error("Failed to track visit:", error);
  }
};

export const trackChannelPlay = async (channel) => {
  try {
    const visitorId = getVisitorId();
    await api.post("/analytics/channel-play", {
      visitorId,
      channelId: channel.id,
      channelName: channel.name,
      category: channel.categories?.[0] || "general",
    });
  } catch (error) {
    console.error("Failed to track channel play:", error);
  }
};

export const trackFavoriteAdd = async (channel) => {
  try {
    const visitorId = getVisitorId();
    await api.post("/analytics/favorite-add", {
      visitorId,
      channelId: channel.id,
      channelName: channel.name,
      category: channel.categories?.[0] || "general",
      logo: channel.logo,
    });
  } catch (error) {
    console.error("Failed to track favorite:", error);
  }
};

export const trackPageView = async (page) => {
  try {
    const visitorId = getVisitorId();
    await api.post("/analytics/page-view", {
      visitorId,
      page,
    });
  } catch (error) {
    console.error("Failed to track page view:", error);
  }
};

export const getAnalyticsStats = async () => {
  const response = await api.get("/analytics/stats");
  return response.data;
};

// Admin API calls
export const verifyAdminPassword = async (password) => {
  const response = await api.post("/admin/verify", { password });
  return response.data;
};

export const getAdminAnalytics = async (password) => {
  const response = await api.get("/admin/analytics", { params: { password } });
  return response.data;
};

// Feedback API calls
export const submitFeedback = async (feedbackData) => {
  const visitorId = getVisitorId();
  const response = await api.post("/feedback/submit", {
    ...feedbackData,
    visitorId,
  });
  return response.data;
};

export const getAdminFeedback = async (
  password,
  status = "all",
  limit = 50
) => {
  const response = await api.get("/feedback/all", {
    params: { password, status, limit },
  });
  return response.data;
};

export const updateFeedbackStatus = async (id, password, status) => {
  const response = await api.patch(`/feedback/${id}/status`, {
    password,
    status,
  });
  return response.data;
};

export const deleteFeedback = async (id, password) => {
  const response = await api.delete(`/feedback/${id}`, {
    params: { password },
  });
  return response.data;
};

export default api;
