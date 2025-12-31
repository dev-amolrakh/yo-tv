import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  X,
  Signal,
  Tv,
  Play,
  Heart,
  Music,
  Film,
  Newspaper,
  Trophy,
  Baby,
  GraduationCap,
  Sparkles,
  Globe,
  Radio,
  Clapperboard,
} from "lucide-react";
import Loading from "../components/Loading";
import { ChannelGridSkeleton } from "../components/SkeletonLoader";
import {
  getIndianChannels,
  getCategories,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  trackVisit,
} from "../services/api";

// Category icons mapping
const categoryIcons = {
  music: Music,
  movies: Film,
  news: Newspaper,
  sports: Trophy,
  kids: Baby,
  education: GraduationCap,
  entertainment: Sparkles,
  general: Globe,
  religious: Radio,
  lifestyle: Clapperboard,
  classic: Film,
  animation: Baby,
  documentary: Film,
  comedy: Sparkles,
  culture: Globe,
};

// Popular categories to show as chips
const popularCategories = [
  { id: "all", name: "All", icon: Tv },
  { id: "entertainment", name: "Entertainment", icon: Sparkles },
  { id: "news", name: "News", icon: Newspaper },
  { id: "movies", name: "Movies", icon: Film },
  { id: "music", name: "Music", icon: Music },
  { id: "sports", name: "Sports", icon: Trophy },
  { id: "kids", name: "Kids", icon: Baby },
  { id: "religious", name: "Religious", icon: Radio },
  { id: "education", name: "Education", icon: GraduationCap },
];

// Supported languages
const supportedLanguages = [
  { code: "all", name: "All Languages" },
  { code: "hin", name: "Hindi" },
  { code: "eng", name: "English" },
  { code: "tam", name: "Tamil" },
  { code: "tel", name: "Telugu" },
  { code: "kan", name: "Kannada" },
  { code: "mal", name: "Malayalam" },
  { code: "mar", name: "Marathi" },
  { code: "ben", name: "Bengali" },
  { code: "guj", name: "Gujarati" },
  { code: "pan", name: "Punjabi" },
];

function Home() {
  const [channels, setChannels] = useState([]);
  const [allChannels, setAllChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [showOnlyLive, setShowOnlyLive] = useState(true);

  // Fetch initial data
  useEffect(() => {
    // Track visit on page load
    trackVisit();

    const fetchData = async () => {
      try {
        setLoading(true);
        const [channelsRes, categoriesRes] = await Promise.all([
          getIndianChannels({ hasStream: "true" }),
          getCategories(),
        ]);

        // Get favorites from localStorage (synchronous)
        const favoritesRes = getFavorites();

        setAllChannels(channelsRes.data);
        setChannels(channelsRes.data);
        setCategories(categoriesRes.data);
        setFavorites(new Set(favoritesRes.data.map((f) => f.id)));
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load channels. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters with useMemo for performance
  const filteredChannels = useMemo(() => {
    let filtered = allChannels;

    // Filter by search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ch) =>
          ch.name.toLowerCase().includes(searchLower) ||
          ch.altNames?.some((n) => n.toLowerCase().includes(searchLower)) ||
          ch.network?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((ch) =>
        ch.categories?.includes(selectedCategory)
      );
    }

    // Filter by language
    if (selectedLanguage && selectedLanguage !== "all") {
      filtered = filtered.filter((ch) =>
        ch.languages?.includes(selectedLanguage)
      );
    }

    // Filter by live status
    if (showOnlyLive) {
      filtered = filtered.filter((ch) => ch.stream !== null);
    }

    return filtered;
  }, [
    searchQuery,
    selectedCategory,
    selectedLanguage,
    showOnlyLive,
    allChannels,
  ]);

  useEffect(() => {
    setChannels(filteredChannels);
  }, [filteredChannels]);

  const handleFavoriteToggle = useCallback(
    (channel, e) => {
      e.preventDefault();
      e.stopPropagation();

      if (favorites.has(channel.id)) {
        removeFromFavorites(channel.id);
        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(channel.id);
          return newSet;
        });
      } else {
        addToFavorites(channel);
        setFavorites((prev) => new Set(prev).add(channel.id));
      }

      // Dispatch event to update navbar count
      window.dispatchEvent(new Event("favoritesUpdated"));
    },
    [favorites]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-dark-200 rounded-xl animate-pulse"></div>
        <ChannelGridSkeleton count={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Group channels by category for featured sections
  const liveChannels = channels.filter((ch) => ch.stream);
  const entertainmentChannels = allChannels
    .filter((ch) => ch.categories?.includes("entertainment") && ch.stream)
    .slice(0, 10);
  const newsChannels = allChannels
    .filter((ch) => ch.categories?.includes("news") && ch.stream)
    .slice(0, 10);
  const musicChannels = allChannels
    .filter((ch) => ch.categories?.includes("music") && ch.stream)
    .slice(0, 10);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Search Bar - Full width on mobile */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search channels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-2.5 md:py-3 bg-dark-200 border border-dark-300 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all text-sm md:text-base"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-dark-300 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Category Chips - Scrollable row below search */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-dark-300 scrollbar-track-transparent -mx-4 px-4 md:mx-0 md:px-0">
        {popularCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? "bg-primary-500 text-white"
                  : "bg-dark-200 text-gray-300 hover:bg-dark-300 border border-dark-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        {/* Language Filter */}
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="px-3 md:px-4 py-1.5 md:py-2 bg-dark-200 border border-dark-300 rounded-lg text-white text-xs md:text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
        >
          {supportedLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>

        {/* Live Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            className={`relative w-9 md:w-10 h-5 rounded-full transition-colors ${
              showOnlyLive ? "bg-primary-500" : "bg-dark-300"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                showOnlyLive ? "translate-x-4 md:translate-x-5" : ""
              }`}
            />
          </div>
          <span className="text-gray-300 text-xs md:text-sm">Live Only</span>
        </label>

        {/* Results Count */}
        <div className="ml-auto text-gray-500 text-xs md:text-sm">
          {channels.length} channels
        </div>
      </div>

      {/* Search Results or Featured Sections */}
      {searchQuery || selectedCategory !== "all" ? (
        // Filtered Results
        <div>
          <div className="flex items-center gap-3 mb-4 md:mb-5">
            <div className="p-2 bg-dark-300/50 rounded-xl">
              <Search className="w-5 h-5 text-primary-400" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : `${
                    popularCategories.find((c) => c.id === selectedCategory)
                      ?.name || "All"
                  } Channels`}
            </h2>
            <span className="text-sm text-gray-500">({channels.length})</span>
          </div>
          {channels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
              {channels.map((channel) => (
                <ChannelCardCompact
                  key={channel.id}
                  channel={channel}
                  isFavorite={favorites.has(channel.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 md:py-20 bg-dark-200/50 backdrop-blur-sm rounded-2xl border border-dark-300/50">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-dark-300/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tv className="w-8 h-8 md:w-10 md:h-10 text-dark-500" />
              </div>
              <p className="text-gray-400 text-sm md:text-base font-medium">
                No channels found
              </p>
              <p className="text-gray-600 text-xs md:text-sm mt-1">
                Try adjusting your filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-5 px-5 py-2 bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 rounded-full text-sm font-medium transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      ) : (
        // Featured Sections
        <>
          {/* All Live Channels */}
          <ChannelSection
            title="Live Now"
            icon={<Signal className="w-5 h-5 text-green-400" />}
            channels={liveChannels.slice(0, 12)}
            favorites={favorites}
            onFavoriteToggle={handleFavoriteToggle}
            showAll={() => setSelectedCategory("all")}
          />

          {/* Entertainment */}
          {entertainmentChannels.length > 0 && (
            <ChannelSection
              title="Entertainment"
              icon={<Sparkles className="w-5 h-5 text-yellow-400" />}
              channels={entertainmentChannels}
              favorites={favorites}
              onFavoriteToggle={handleFavoriteToggle}
              showAll={() => setSelectedCategory("entertainment")}
            />
          )}

          {/* News */}
          {newsChannels.length > 0 && (
            <ChannelSection
              title="News"
              icon={<Newspaper className="w-5 h-5 text-blue-400" />}
              channels={newsChannels}
              favorites={favorites}
              onFavoriteToggle={handleFavoriteToggle}
              showAll={() => setSelectedCategory("news")}
            />
          )}

          {/* Music */}
          {musicChannels.length > 0 && (
            <ChannelSection
              title="Music"
              icon={<Music className="w-5 h-5 text-pink-400" />}
              channels={musicChannels}
              favorites={favorites}
              onFavoriteToggle={handleFavoriteToggle}
              showAll={() => setSelectedCategory("music")}
            />
          )}
        </>
      )}
    </div>
  );
}

// Channel Section Component
function ChannelSection({
  title,
  icon,
  channels,
  favorites,
  onFavoriteToggle,
  showAll,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 bg-dark-300/50 rounded-xl">{icon}</div>
          <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
        </div>
        <button
          onClick={showAll}
          className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-xs md:text-sm font-medium transition-colors"
        >
          See All
          <span className="text-lg">→</span>
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
        {channels.map((channel) => (
          <ChannelCardCompact
            key={channel.id}
            channel={channel}
            isFavorite={favorites.has(channel.id)}
            onFavoriteToggle={onFavoriteToggle}
          />
        ))}
      </div>
    </div>
  );
}

// Compact Channel Card Component - Professional Minimalist Design
function ChannelCardCompact({ channel, isFavorite, onFavoriteToggle }) {
  const hasStream = !!channel.stream;

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle(channel, e);
  };

  return (
    <div className="group relative">
      <Link
        to={hasStream ? `/player/${channel.id}` : "#"}
        className={`block bg-dark-200/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-dark-300/50 transition-all duration-300 ${
          hasStream
            ? "hover:border-primary-500/40 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1"
            : "opacity-50 cursor-not-allowed"
        }`}
      >
        {/* Thumbnail Container */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-dark-300 to-dark-400 flex items-center justify-center overflow-hidden">
          {/* Background Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-200 via-transparent to-transparent opacity-60" />

          {channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain p-4 md:p-5 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.classList.remove("hidden");
              }}
            />
          ) : null}
          <div
            className={`${
              channel.logo ? "hidden" : ""
            } flex flex-col items-center justify-center`}
          >
            <Tv className="w-10 h-10 md:w-12 md:h-12 text-dark-500" />
          </div>

          {/* Live Badge - Pill Style */}
          {hasStream && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3">
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500 rounded-full shadow-lg shadow-green-500/30">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-white tracking-wide">
                  LIVE
                </span>
              </div>
            </div>
          )}

          {/* Play Button Overlay */}
          {hasStream && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="bg-primary-500/90 backdrop-blur-sm rounded-full p-3 md:p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl shadow-primary-500/30">
                <Play className="w-5 h-5 md:w-6 md:h-6 text-white fill-white" />
              </div>
            </div>
          )}
        </div>

        {/* Channel Info */}
        <div className="p-3 md:p-4">
          <h3
            className="font-semibold text-white text-sm md:text-base truncate leading-tight"
            title={channel.name}
          >
            {channel.name}
          </h3>
          <div className="flex items-center justify-between mt-1.5 md:mt-2">
            <p className="text-gray-500 text-[11px] md:text-xs truncate flex-1 mr-2">
              {channel.network ||
                (channel.categories?.[0]
                  ? channel.categories[0].charAt(0).toUpperCase() +
                    channel.categories[0].slice(1)
                  : "Entertainment")}
            </p>
            {channel.categories?.[0] && (
              <span className="px-2 py-0.5 text-[9px] md:text-[10px] bg-primary-500/10 text-primary-400 rounded-full font-medium capitalize whitespace-nowrap">
                {channel.categories[0]}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Favorite Button - Outside Link for Better Click Handling */}
      <button
        type="button"
        onClick={handleFavoriteClick}
        className={`absolute top-2 right-2 md:top-3 md:right-3 p-2 md:p-2.5 rounded-full transition-all duration-200 z-20 ${
          isFavorite
            ? "bg-red-500 text-white shadow-lg shadow-red-500/40 scale-100"
            : "bg-black/40 backdrop-blur-sm text-white/80 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 md:opacity-0 md:group-hover:opacity-100"
        }`}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-200 ${
            isFavorite ? "fill-current scale-110" : "group-hover:scale-110"
          }`}
        />
      </button>
    </div>
  );
}

export default Home;
