import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  ExternalLink,
  Tv,
  Play,
  ChevronRight,
  Share2,
  Signal,
} from "lucide-react";
import VideoPlayer from "../components/VideoPlayer";
import Loading from "../components/Loading";
import {
  getChannelById,
  addToFavorites,
  removeFromFavorites,
  checkIsFavorite,
  getRelatedChannels,
  trackChannelPlay,
} from "../services/api";

function Player() {
  const { channelId } = useParams();
  const [channel, setChannel] = useState(null);
  const [relatedChannels, setRelatedChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        setLoading(true);
        const channelRes = await getChannelById(channelId);

        // Check favorite from localStorage (synchronous)
        const favoriteRes = checkIsFavorite(channelId);

        setChannel(channelRes.data);
        setIsFavorite(favoriteRes.isFavorite);

        // Track channel play in analytics
        trackChannelPlay(channelRes.data);

        // Fetch related channels
        try {
          const relatedRes = await getRelatedChannels(channelId);
          setRelatedChannels(relatedRes.data || []);
        } catch (err) {
          console.error("Error fetching related channels:", err);
        }
      } catch (err) {
        console.error("Error fetching channel:", err);
        setError("Failed to load channel. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
    window.scrollTo(0, 0);
  }, [channelId]);

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      removeFromFavorites(channel.id);
      setIsFavorite(false);
    } else {
      addToFavorites(channel);
      setIsFavorite(true);
    }

    // Dispatch event to update navbar count
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: channel.name,
        text: `Watch ${channel.name} live`,
        url: window.location.href,
      });
    } catch (err) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return <Loading message="Loading channel..." />;
  }

  if (error || !channel) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Tv className="w-16 h-16 text-dark-400 mb-4" />
        <p className="text-red-400 mb-4">{error || "Channel not found"}</p>
        <Link
          to="/"
          className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-3 md:mb-4 text-sm md:text-base"
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
        Back to channels
      </Link>

      {/* Main Content Grid - Video + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Left Column - Video and Info */}
        <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
          {/* Video Player */}
          <div className="rounded-lg md:rounded-xl overflow-hidden shadow-2xl bg-black aspect-video -mx-3 md:mx-0">
            <VideoPlayer
              streamUrl={channel.stream?.url}
              title={channel.name}
              referrer={channel.stream?.referrer}
              userAgent={channel.stream?.userAgent}
            />
          </div>

          {/* Channel Title & Actions */}
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-start justify-between gap-2 md:gap-4">
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-white">
                  {channel.name}
                </h1>
                <div className="flex items-center gap-2 md:gap-3 mt-1">
                  {channel.network && (
                    <p className="text-gray-400 text-sm md:text-base">
                      {channel.network}
                    </p>
                  )}
                  {channel.stream && (
                    <div className="flex items-center gap-1 text-green-400 text-xs md:text-sm">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse" />
                      Live
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleFavoriteToggle}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
                  isFavorite
                    ? "bg-red-500/20 text-red-400"
                    : "bg-dark-200 text-gray-300 hover:bg-dark-300"
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                    isFavorite ? "fill-current" : ""
                  }`}
                />
                {isFavorite ? "Saved" : "Save"}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium bg-dark-200 text-gray-300 hover:bg-dark-300 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Share
              </button>

              {channel.website && (
                <a
                  href={channel.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium bg-dark-200 text-gray-300 hover:bg-dark-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Website
                </a>
              )}
            </div>

            {/* Channel Details Card */}
            <div className="bg-dark-200 rounded-lg md:rounded-xl p-3 md:p-4 space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 md:gap-4">
                {/* Logo */}
                <div className="w-12 h-12 md:w-16 md:h-16 bg-dark-300 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <Tv className="w-8 h-8 text-dark-400" />
                  )}
                </div>

                {/* Categories */}
                <div className="flex-1">
                  {channel.categories && channel.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {channel.categories.map((category) => (
                        <Link
                          key={category}
                          to={`/?category=${category}`}
                          className="px-3 py-1 text-xs bg-dark-300 text-gray-300 rounded-full capitalize hover:bg-dark-400 transition-colors"
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  )}
                  {channel.stream?.quality && (
                    <p className="text-gray-500 text-sm mt-2">
                      Quality: {channel.stream.quality}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Related Channels */}
        <div className="w-full lg:w-[340px] xl:w-[360px] flex-shrink-0">
          <div className="lg:sticky lg:top-4">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-semibold text-white">
                Related Channels
              </h2>
              <Link
                to="/"
                className="text-primary-400 text-xs md:text-sm hover:text-primary-300 flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </Link>
            </div>

            {/* Related Channels List - Horizontal scroll on mobile, vertical on desktop */}
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[calc(100vh-180px)] pb-2 lg:pb-0 lg:pr-1 scrollbar-thin scrollbar-thumb-dark-300 scrollbar-track-transparent -mx-3 px-3 lg:mx-0 lg:px-0">
              {relatedChannels.length > 0 ? (
                relatedChannels.map((relChannel) => (
                  <RelatedChannelCard
                    key={relChannel.id}
                    channel={relChannel}
                    isCurrentChannel={relChannel.id === channel.id}
                  />
                ))
              ) : (
                <div className="text-center py-6 md:py-8 bg-dark-200 rounded-xl w-full">
                  <Signal className="w-8 h-8 md:w-10 md:h-10 text-dark-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs md:text-sm">
                    No related channels found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Related Channel Card Component
function RelatedChannelCard({ channel, isCurrentChannel }) {
  const hasStream = !!channel.stream;

  if (isCurrentChannel) return null;

  return (
    <Link
      to={hasStream ? `/player/${channel.id}` : "#"}
      className={`group flex flex-col lg:flex-row gap-2 lg:gap-3 p-2 rounded-lg transition-all flex-shrink-0 w-36 lg:w-auto ${
        hasStream
          ? "hover:bg-dark-200 cursor-pointer active:scale-95"
          : "opacity-50 cursor-not-allowed"
      }`}
    >
      {/* Thumbnail */}
      <div className="relative w-full lg:w-40 aspect-video flex-shrink-0 bg-dark-200 rounded-lg overflow-hidden flex items-center justify-center">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <Tv className="w-6 h-6 lg:w-8 lg:h-8 text-dark-400" />
        )}

        {/* Live Badge */}
        {hasStream && (
          <div className="absolute bottom-1 left-1 flex items-center gap-0.5 lg:gap-1 px-1 lg:px-1.5 py-0.5 bg-green-500/90 rounded text-[8px] lg:text-[10px] font-bold text-white">
            <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}

        {/* Play Overlay - Hidden on mobile */}
        {hasStream && (
          <div className="hidden lg:flex absolute inset-0 items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
            <div className="bg-white/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all">
              <Play className="w-4 h-4 text-black fill-black" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 lg:py-1">
        <h3 className="font-medium text-white text-xs lg:text-sm line-clamp-2 group-hover:text-primary-400 transition-colors">
          {channel.name}
        </h3>
        <p className="text-gray-500 text-[10px] lg:text-xs mt-0.5 lg:mt-1 truncate">
          {channel.network || channel.categories?.[0] || "Channel"}
        </p>
      </div>
    </Link>
  );
}

export default Player;
