import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, Play, Tv } from "lucide-react";
import Loading from "../components/Loading";
import { getFavorites, removeFromFavorites } from "../services/api";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Get favorites from localStorage (synchronous)
    const response = getFavorites();
    setFavorites(response.data);
    setLoading(false);
  }, []);

  const handleRemove = (channelId) => {
    removeFromFavorites(channelId);
    setFavorites((prev) => prev.filter((f) => f.id !== channelId));

    // Dispatch event to update navbar count
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  if (loading) {
    return <Loading message="Loading favorites..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">My Favorites</h1>
          <p className="text-gray-400 mt-1">
            {favorites.length} saved channel{favorites.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Favorites List */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-dark-200 rounded-xl overflow-hidden border border-dark-300 hover:border-primary-500/50 transition-all"
            >
              <div className="flex items-center gap-4 p-4">
                {/* Logo */}
                <div className="w-16 h-16 bg-dark-300 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {favorite.logo ? (
                    <img
                      src={favorite.logo}
                      alt={favorite.name}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <Tv className="w-8 h-8 text-dark-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">
                    {favorite.name}
                  </h3>
                  {favorite.network && (
                    <p className="text-sm text-gray-500 truncate">
                      {favorite.network}
                    </p>
                  )}
                  {favorite.categories?.[0] && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-dark-300 text-gray-400 rounded-full capitalize">
                      {favorite.categories[0]}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/player/${favorite.id}`}
                    className="p-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                    title="Watch now"
                  >
                    <Play className="w-5 h-5 text-white" />
                  </Link>
                  <button
                    onClick={() => handleRemove(favorite.id)}
                    className="p-2 bg-dark-300 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-200 rounded-xl">
          <Heart className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No favorites yet
          </h2>
          <p className="text-gray-400 mb-6">
            Start adding channels to your favorites list to easily access them
            later.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            Browse Channels
          </Link>
        </div>
      )}
    </div>
  );
}

export default Favorites;
