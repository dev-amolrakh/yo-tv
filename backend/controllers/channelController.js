import axios from "axios";
import NodeCache from "node-cache";

// Aggressive caching - 2 hours for channel data (reduces API calls significantly)
const cache = new NodeCache({ stdTTL: 7200, checkperiod: 600 });

const API_BASE = "https://iptv-org.github.io/api";

// Configure axios for faster requests
const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    "Accept-Encoding": "gzip, deflate",
  },
});

// Fetch all channels
export const getAllChannels = async (req, res) => {
  try {
    const cacheKey = "all_channels";
    let channels = cache.get(cacheKey);

    if (!channels) {
      const response = await axios.get(`${API_BASE}/channels.json`);
      channels = response.data;
      cache.set(cacheKey, channels);
    }

    res.json({ success: true, count: channels.length, data: channels });
  } catch (error) {
    console.error("Error fetching channels:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch channels" });
  }
};

// Fetch Indian channels only
export const getIndianChannels = async (req, res) => {
  try {
    const cacheKey = "indian_channels";
    let indianChannels = cache.get(cacheKey);

    if (!indianChannels) {
      // Fetch channels, streams, and logos in parallel with optimized axios
      const [channelsRes, streamsRes, logosRes] = await Promise.all([
        axiosInstance.get(`${API_BASE}/channels.json`),
        axiosInstance.get(`${API_BASE}/streams.json`),
        axiosInstance.get(`${API_BASE}/logos.json`),
      ]);

      const channels = channelsRes.data;
      const streams = streamsRes.data;
      const logos = logosRes.data;

      // Filter Indian channels (country code: IN)
      const indiaChannels = channels.filter(
        (ch) => ch.country === "IN" && !ch.closed
      );

      // Create optimized maps for O(1) lookup
      const streamMap = new Map();
      streams.forEach((stream) => {
        if (stream.channel && !streamMap.has(stream.channel)) {
          streamMap.set(stream.channel, stream);
        }
      });

      // Create a map of logos by channel ID
      const logoMap = new Map();
      logos.forEach((logo) => {
        if (logo.channel && !logoMap.has(logo.channel)) {
          logoMap.set(logo.channel, logo);
        }
      });

      // Combine data with optimized map lookups
      indianChannels = indiaChannels.map((channel) => {
        const stream = streamMap.get(channel.id);
        const logo = logoMap.get(channel.id);

        return {
          id: channel.id,
          name: channel.name,
          altNames: channel.alt_names || [],
          network: channel.network,
          categories: channel.categories || [],
          languages: channel.languages || [],
          isNsfw: channel.is_nsfw,
          website: channel.website,
          logo: logo?.url || null,
          stream: stream
            ? {
                url: stream.url,
                quality: stream.quality,
                referrer: stream.referrer,
                userAgent: stream.user_agent,
              }
            : null,
        };
      });

      cache.set(cacheKey, indianChannels);
    }

    // Apply filters
    let filteredChannels = indianChannels;

    // Filter by category (optimized - avoid spread)
    if (req.query.category) {
      const cat = req.query.category.toLowerCase();
      filteredChannels = filteredChannels.filter((ch) =>
        ch.categories.includes(cat)
      );
    }

    // Filter by search query
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredChannels = filteredChannels.filter(
        (ch) =>
          ch.name.toLowerCase().includes(searchTerm) ||
          ch.altNames.some((name) => name.toLowerCase().includes(searchTerm))
      );
    }

    // Filter only channels with streams
    if (req.query.hasStream === "true") {
      filteredChannels = filteredChannels.filter((ch) => ch.stream !== null);
    }

    // Filter by language
    if (req.query.language && req.query.language !== "all") {
      filteredChannels = filteredChannels.filter((ch) =>
        ch.languages?.includes(req.query.language)
      );
    }

    res.json({
      success: true,
      count: filteredChannels.length,
      total: indianChannels.length,
      data: filteredChannels,
    });
  } catch (error) {
    console.error("Error fetching Indian channels:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch Indian channels" });
  }
};

// Get channel by ID
export const getChannelById = async (req, res) => {
  try {
    const { id } = req.params;

    const [channelsRes, streamsRes, logosRes] = await Promise.all([
      axios.get(`${API_BASE}/channels.json`),
      axios.get(`${API_BASE}/streams.json`),
      axios.get(`${API_BASE}/logos.json`),
    ]);

    const channel = channelsRes.data.find((ch) => ch.id === id);

    if (!channel) {
      return res
        .status(404)
        .json({ success: false, message: "Channel not found" });
    }

    const stream = streamsRes.data.find((s) => s.channel === id);
    const logo = logosRes.data.find((l) => l.channel === id);

    const channelData = {
      id: channel.id,
      name: channel.name,
      altNames: channel.alt_names || [],
      network: channel.network,
      categories: channel.categories || [],
      isNsfw: channel.is_nsfw,
      website: channel.website,
      logo: logo?.url || null,
      stream: stream
        ? {
            url: stream.url,
            quality: stream.quality,
            referrer: stream.referrer,
            userAgent: stream.user_agent,
          }
        : null,
    };

    res.json({ success: true, data: channelData });
  } catch (error) {
    console.error("Error fetching channel:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch channel" });
  }
};

// Get categories
export const getCategories = async (req, res) => {
  try {
    const cacheKey = "categories";
    let categories = cache.get(cacheKey);

    if (!categories) {
      const response = await axios.get(`${API_BASE}/categories.json`);
      categories = response.data;
      cache.set(cacheKey, categories);
    }

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
};

// Get streams for Indian channels
export const getIndianStreams = async (req, res) => {
  try {
    const cacheKey = "indian_streams";
    let indianStreams = cache.get(cacheKey);

    if (!indianStreams) {
      const [channelsRes, streamsRes] = await Promise.all([
        axios.get(`${API_BASE}/channels.json`),
        axios.get(`${API_BASE}/streams.json`),
      ]);

      const indianChannelIds = new Set(
        channelsRes.data
          .filter((ch) => ch.country === "IN" && !ch.closed)
          .map((ch) => ch.id)
      );

      indianStreams = streamsRes.data.filter(
        (stream) => stream.channel && indianChannelIds.has(stream.channel)
      );

      cache.set(cacheKey, indianStreams);
    }

    res.json({
      success: true,
      count: indianStreams.length,
      data: indianStreams,
    });
  } catch (error) {
    console.error("Error fetching Indian streams:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch Indian streams" });
  }
};

// Get languages for Indian channels
export const getLanguages = async (req, res) => {
  try {
    const cacheKey = "languages";
    let languages = cache.get(cacheKey);

    if (!languages) {
      const response = await axios.get(`${API_BASE}/languages.json`);
      // Filter common Indian languages
      const indianLanguageCodes = [
        "hin",
        "tam",
        "tel",
        "kan",
        "mal",
        "mar",
        "ben",
        "guj",
        "pan",
        "ori",
        "asm",
        "urd",
        "eng",
      ];
      languages = response.data.filter((lang) =>
        indianLanguageCodes.includes(lang.code)
      );
      cache.set(cacheKey, languages);
    }

    res.json({ success: true, data: languages });
  } catch (error) {
    console.error("Error fetching languages:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch languages" });
  }
};

// Get related/recommended channels
export const getRelatedChannels = async (req, res) => {
  try {
    const { channelId } = req.params;
    const cacheKey = "indian_channels";
    let indianChannels = cache.get(cacheKey);

    if (!indianChannels) {
      const [channelsRes, streamsRes, logosRes] = await Promise.all([
        axios.get(`${API_BASE}/channels.json`),
        axios.get(`${API_BASE}/streams.json`),
        axios.get(`${API_BASE}/logos.json`),
      ]);

      const channels = channelsRes.data;
      const streams = streamsRes.data;
      const logos = logosRes.data;

      const indiaChannels = channels.filter(
        (ch) => ch.country === "IN" && !ch.closed
      );

      const streamMap = {};
      streams.forEach((stream) => {
        if (stream.channel && !streamMap[stream.channel]) {
          streamMap[stream.channel] = stream;
        }
      });

      const logoMap = {};
      logos.forEach((logo) => {
        if (logo.channel && !logoMap[logo.channel]) {
          logoMap[logo.channel] = logo;
        }
      });

      indianChannels = indiaChannels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        altNames: channel.alt_names || [],
        network: channel.network,
        categories: channel.categories || [],
        isNsfw: channel.is_nsfw,
        website: channel.website,
        logo: logoMap[channel.id]?.url || null,
        stream: streamMap[channel.id]
          ? {
              url: streamMap[channel.id].url,
              quality: streamMap[channel.id].quality,
              referrer: streamMap[channel.id].referrer,
              userAgent: streamMap[channel.id].user_agent,
            }
          : null,
      }));

      cache.set(cacheKey, indianChannels);
    }

    // Find the current channel
    const currentChannel = indianChannels.find((ch) => ch.id === channelId);

    if (!currentChannel) {
      return res
        .status(404)
        .json({ success: false, message: "Channel not found" });
    }

    // Find related channels by category and network
    let relatedChannels = indianChannels.filter((ch) => {
      if (ch.id === channelId) return false;
      if (!ch.stream) return false; // Only with streams

      // Same category match
      const categoryMatch = ch.categories.some((cat) =>
        currentChannel.categories.includes(cat)
      );

      // Same network match
      const networkMatch = ch.network === currentChannel.network;

      return categoryMatch || networkMatch;
    });

    // Sort by relevance (same network first, then same category)
    relatedChannels.sort((a, b) => {
      const aNetwork = a.network === currentChannel.network ? 1 : 0;
      const bNetwork = b.network === currentChannel.network ? 1 : 0;
      return bNetwork - aNetwork;
    });

    // Limit to 15 channels
    relatedChannels = relatedChannels.slice(0, 15);

    // If not enough related channels, add random live channels
    if (relatedChannels.length < 10) {
      const otherChannels = indianChannels.filter(
        (ch) =>
          ch.id !== channelId &&
          ch.stream &&
          !relatedChannels.find((r) => r.id === ch.id)
      );

      // Shuffle and take remaining
      const shuffled = otherChannels.sort(() => Math.random() - 0.5);
      relatedChannels = [
        ...relatedChannels,
        ...shuffled.slice(0, 15 - relatedChannels.length),
      ];
    }

    res.json({
      success: true,
      count: relatedChannels.length,
      data: relatedChannels,
    });
  } catch (error) {
    console.error("Error fetching related channels:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch related channels" });
  }
};
