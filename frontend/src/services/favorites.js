// LocalStorage-based favorites service
// Stores minimal data for efficiency

const FAVORITES_KEY = "yo_tv_favorites";

// Get all favorites from localStorage
export const getFavorites = () => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error("Error reading favorites:", error);
    return [];
  }
};

// Add channel to favorites
export const addToFavorites = (channel) => {
  try {
    const favorites = getFavorites();

    // Check if already exists
    if (favorites.some((fav) => fav.id === channel.id)) {
      return { success: false, message: "Already in favorites" };
    }

    // Store minimal data
    const favoriteData = {
      id: channel.id,
      name: channel.name,
      logo: channel.logo || null,
      network: channel.network || null,
      categories: channel.categories?.slice(0, 2) || [],
      addedAt: Date.now(),
    };

    favorites.unshift(favoriteData); // Add to beginning
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

    return { success: true, data: favoriteData };
  } catch (error) {
    console.error("Error adding favorite:", error);
    return { success: false, message: "Failed to add favorite" };
  }
};

// Remove channel from favorites
export const removeFromFavorites = (channelId) => {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter((fav) => fav.id !== channelId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return { success: true };
  } catch (error) {
    console.error("Error removing favorite:", error);
    return { success: false, message: "Failed to remove favorite" };
  }
};

// Check if channel is in favorites
export const isFavorite = (channelId) => {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.id === channelId);
};

// Get favorites count
export const getFavoritesCount = () => {
  return getFavorites().length;
};

// Clear all favorites
export const clearFavorites = () => {
  try {
    localStorage.removeItem(FAVORITES_KEY);
    return { success: true };
  } catch (error) {
    console.error("Error clearing favorites:", error);
    return { success: false };
  }
};
