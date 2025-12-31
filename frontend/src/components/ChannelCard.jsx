import { memo } from "react";
import { Link } from "react-router-dom";
import { Play, Heart, Tv, Signal } from "lucide-react";

const ChannelCard = memo(({ channel, onFavoriteToggle, isFavorite }) => {
  const hasStream = channel.stream !== null;

  return (
    <div className="channel-card bg-dark-200 rounded-xl overflow-hidden border border-dark-300 hover:border-primary-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/20">
      {/* Channel Logo/Image */}
      <div className="relative aspect-video bg-dark-300 flex items-center justify-center">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
              e.target.parentElement.querySelector(
                ".fallback-icon"
              ).style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`fallback-icon absolute inset-0 items-center justify-center ${
            channel.logo ? "hidden" : "flex"
          }`}
        >
          <Tv className="w-16 h-16 text-dark-400" />
        </div>

        {/* Stream Status Badge */}
        <div
          className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            hasStream
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          <Signal className="w-3 h-3" />
          {hasStream ? "Live" : "Offline"}
        </div>

        {/* Play Overlay */}
        {hasStream && (
          <Link
            to={`/player/${channel.id}`}
            className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </Link>
        )}
      </div>

      {/* Channel Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-white truncate"
              title={channel.name}
            >
              {channel.name}
            </h3>
            {channel.network && (
              <p className="text-sm text-gray-400 truncate">
                {channel.network}
              </p>
            )}
          </div>
          <button
            onClick={() => onFavoriteToggle(channel)}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite
                ? "text-red-500 hover:bg-red-500/10"
                : "text-gray-400 hover:text-red-500 hover:bg-dark-300"
            }`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Categories */}
        {channel.categories && channel.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {channel.categories.slice(0, 3).map((category) => (
              <span
                key={category}
                className="px-2 py-0.5 text-xs bg-dark-300 text-gray-300 rounded-full capitalize"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Watch Button */}
        {hasStream && (
          <Link
            to={`/player/${channel.id}`}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium"
          >
            <Play className="w-4 h-4" />
            Watch Now
          </Link>
        )}
      </div>
    </div>
  );
});

ChannelCard.displayName = "ChannelCard";

export default ChannelCard;
