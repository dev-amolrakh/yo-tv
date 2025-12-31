# 📺 Yo TV - Your Omni Television

A modern web application to stream live TV channels built with React, Tailwind CSS, Node.js Express, and MongoDB.

## 📸 Features

- ✅ Browse TV channels
- ✅ Search channels by name
- ✅ Filter by category
- ✅ Live stream playback (HLS)
- ✅ **YouTube-like Professional Video Player**
  - Play/Pause with spacebar
  - Volume control with slider
  - Progress bar with buffering indicator
  - Skip forward/backward (10s)
  - Playback speed control (0.25x - 2x)
  - Quality selector (auto/manual)
  - Fullscreen mode
  - Picture-in-Picture mode
  - Keyboard shortcuts
  - Auto-hide controls
  - Loading states
- ✅ Favorite channels (saved in MongoDB)
- ✅ Responsive design
- ✅ Dark mode UI with minimalist aesthetics

## 🛠️ Tech Stack

**Frontend:**

- React 18
- Tailwind CSS
- React Router DOM
- HLS.js (for video streaming)
- Axios
- Lucide React (icons)
- Vite

**Backend:**

- Node.js
- Express.js
- MongoDB (Mongoose)
- Node-Cache (for API caching)

**Data Source:**

- [IPTV-org API](https://github.com/iptv-org/api)

## 📋 Prerequisites

- Node.js 18+
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## 🚀 Getting Started

### 1. Clone the repository

```bash
cd streaming-web-app
```

### 2. Install dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure environment variables

The backend `.env` file is already created with defaults:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/yo-tv
NODE_ENV=development
```

Update `MONGODB_URI` if using MongoDB Atlas or different configuration.

### 4. Start MongoDB

Make sure MongoDB is running on your machine:

```bash
# Windows (if installed as service)
net start MongoDB

# Or start mongod manually
mongod
```

### 5. Start the application

**Terminal 1 - Start Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Start Frontend:**

```bash
cd frontend
npm run dev
```

### 6. Open the app

Open your browser and navigate to: `http://localhost:3000`

## 📁 Project Structure

```
streaming-web-app/
├── api/                    # Cloned IPTV-org API reference
├── backend/
│   ├── controllers/
│   │   ├── channelController.js
│   │   └── favoriteController.js
│   ├── models/
│   │   └── Favorite.js
│   ├── routes/
│   │   ├── channelRoutes.js
│   │   └── favoriteRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── tv-icon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChannelCard.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── VideoPlayer.jsx
│   │   ├── pages/
│   │   │   ├── Favorites.jsx
│   │   │   ├── Home.jsx
│   │   │   └── Player.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Channels

| Method | Endpoint                             | Description                  |
| ------ | ------------------------------------ | ---------------------------- |
| GET    | `/api/channels`                      | Get all channels             |
| GET    | `/api/channels/india`                | Get channels only            |
| GET    | `/api/channels/india?search=zee`     | Search channels              |
| GET    | `/api/channels/india?category=news`  | Filter by category           |
| GET    | `/api/channels/india?hasStream=true` | Filter channels with streams |
| GET    | `/api/channels/categories`           | Get all categories           |
| GET    | `/api/channels/:id`                  | Get channel by ID            |

### Favorites

| Method | Endpoint                          | Description                  |
| ------ | --------------------------------- | ---------------------------- |
| GET    | `/api/favorites`                  | Get all favorites            |
| POST   | `/api/favorites`                  | Add to favorites             |
| GET    | `/api/favorites/check/:channelId` | Check if channel is favorite |
| DELETE | `/api/favorites/:channelId`       | Remove from favorites        |

## ⚠️ Known Limitations

1. **CORS Issues:** Some streams may not play due to CORS restrictions. This is a browser security feature that cannot be bypassed without a proxy server.

2. **Geographic Restrictions:** Some channels may be geographically restricted.

3. **Stream Availability:** Streams can go offline at any time as they are provided by third parties.

## ⌨️ Keyboard Shortcuts

The video player supports the following keyboard shortcuts:

- **Space / K** - Play/Pause
- **F** - Toggle Fullscreen
- **M** - Mute/Unmute
- **← (Left Arrow)** - Rewind 10 seconds
- **→ (Right Arrow)** - Forward 10 seconds
- **↑ (Up Arrow)** - Increase volume
- **↓ (Down Arrow)** - Decrease volume

## 🔜 Future Enhancements

- [ ] Add user authentication
- [ ] Implement channel history
- [ ] Add EPG (Electronic Program Guide)
- [ ] Create playlists
- [ ] Add stream quality selector
- [ ] Implement proxy server for CORS issues
- [ ] Add PWA support
- [ ] Add keyboard shortcuts

## 📄 License

MIT License - feel free to use this project for learning purposes.

## 🙏 Credits

- Channel data from [IPTV-org](https://github.com/iptv-org)
- Icons from [Lucide](https://lucide.dev/)
