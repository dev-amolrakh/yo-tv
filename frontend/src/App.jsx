import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import Loading from "./components/Loading";

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const Player = lazy(() => import("./pages/Player"));
const Favorites = lazy(() => import("./pages/Favorites"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-dark-100 to-black">
        <Navbar />
        <main className="container mx-auto px-3 md:px-4 py-4 md:py-6">
          <Suspense fallback={<Loading message="Loading page..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/player/:channelId" element={<Player />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
