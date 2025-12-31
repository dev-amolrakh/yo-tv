import { Link, useLocation } from "react-router-dom";
import {
  Tv,
  Heart,
  Home,
  Info,
  X,
  Send,
  ExternalLink,
  Shield,
  Code,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getFavoritesCount, submitFeedback } from "../services/api";

function Navbar() {
  const location = useLocation();
  const [favCount, setFavCount] = useState(0);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "feedback",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  useEffect(() => {
    const updateFavCount = () => {
      setFavCount(getFavoritesCount());
    };

    updateFavCount();

    // Listen for storage changes (for cross-tab sync)
    window.addEventListener("storage", updateFavCount);

    // Also listen for custom event for same-tab updates
    window.addEventListener("favoritesUpdated", updateFavCount);

    // Refresh count periodically
    const interval = setInterval(updateFavCount, 1000);

    return () => {
      window.removeEventListener("storage", updateFavCount);
      window.removeEventListener("favoritesUpdated", updateFavCount);
      clearInterval(interval);
    };
  }, [location.pathname]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setShowAboutModal(false);
    };
    if (showAboutModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showAboutModal]);

  const isActive = (path) => location.pathname === path;

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const result = await submitFeedback(feedbackForm);
      if (result.success) {
        setSubmitResult({ type: "success", message: result.message });
        setFeedbackForm({
          name: "",
          email: "",
          subject: "",
          message: "",
          type: "feedback",
        });
      }
    } catch (error) {
      setSubmitResult({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to submit feedback. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setShowAboutModal(true);
    setActiveTab("about");
    setSubmitResult(null);
  };

  return (
    <>
      <nav className="bg-dark-200 border-b border-dark-300 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2"
              title="Your Omni Television"
            >
              <Tv className="w-8 h-8 text-primary-500" />
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent leading-tight">
                  Yo TV
                </span>
                <span className="text-[10px] text-gray-500 hidden sm:block leading-none">
                  Your Omni Television
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive("/")
                    ? "bg-primary-500 text-white"
                    : "text-gray-400 hover:text-white hover:bg-dark-300"
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link
                to="/favorites"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative ${
                  isActive("/favorites")
                    ? "bg-primary-500 text-white"
                    : "text-gray-400 hover:text-white hover:bg-dark-300"
                }`}
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Favorites</span>
                {favCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </Link>
              {/* About & Feedback Button */}
              <button
                onClick={openModal}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-gray-400 hover:text-white hover:bg-dark-300"
                title="About & Feedback"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">About</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* About & Feedback Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setShowAboutModal(false)}
          />
          <div className="relative bg-dark-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-dark-300 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-300 bg-dark-300/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-500/20 rounded-xl">
                  <Tv className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Yo TV</h2>
                  <p className="text-xs text-gray-500">Your Omni Television</p>
                </div>
              </div>
              <button
                onClick={() => setShowAboutModal(false)}
                className="p-2 hover:bg-dark-400 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-dark-300">
              <button
                onClick={() => setActiveTab("about")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === "about"
                    ? "text-primary-400 border-b-2 border-primary-500 bg-primary-500/5"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Info className="w-4 h-4" />
                About
              </button>
              <button
                onClick={() => {
                  setActiveTab("feedback");
                  setSubmitResult(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === "feedback"
                    ? "text-primary-400 border-b-2 border-primary-500 bg-primary-500/5"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Feedback
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-5">
              {activeTab === "about" ? (
                <div className="space-y-5">
                  {/* App Description */}
                  <div className="bg-dark-300/50 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Tv className="w-4 h-4 text-primary-400" />
                      What is Yo TV?
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Yo TV (Your Omni Television) is a free, open-source web
                      application that aggregates publicly available live TV
                      streams from around the world. Our platform provides easy
                      access to Indian television channels including
                      entertainment, news, sports, music, and more — all in one
                      place.
                    </p>
                  </div>

                  {/* Open Source API Notice */}
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Open Source API
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">
                      This application uses the{" "}
                      <strong className="text-green-400">IPTV-Org API</strong>,
                      which is a completely open-source and publicly available
                      API. The API provides a collection of publicly accessible
                      IPTV streams from around the world.
                    </p>
                    <a
                      href="https://github.com/iptv-org/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View IPTV-Org API on GitHub
                    </a>
                  </div>

                  {/* Legal Disclaimer */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Legal Disclaimer & Copyright Notice
                    </h3>
                    <ul className="text-gray-300 text-sm space-y-2 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>
                          <strong>No Content Ownership:</strong> Yo TV does NOT
                          own, host, or store any video content. All streams are
                          sourced from publicly available, open-source APIs.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>
                          <strong>No Copyright Infringement:</strong> We do not
                          copy, reproduce, or redistribute any copyrighted
                          content. We simply display publicly available stream
                          links.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>
                          <strong>Third-Party Streams:</strong> All channel
                          streams are provided by third-party sources through
                          the IPTV-Org open-source project. We have no control
                          over stream availability.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>
                          <strong>No Commercial Use:</strong> This is a free,
                          non-commercial, educational project demonstrating web
                          development technologies.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>
                          <strong>Takedown Requests:</strong> If you are a
                          content owner and believe your content is being
                          displayed without permission, please contact us
                          through the feedback form.
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Tech Stack */}
                  <div className="bg-dark-300/50 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Code className="w-4 h-4 text-primary-400" />
                      Technology Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "React",
                        "Vite",
                        "Tailwind CSS",
                        "Node.js",
                        "Express",
                        "MongoDB",
                        "HLS.js",
                      ].map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-dark-400 text-gray-300 text-xs rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Credits */}
                  <div className="text-center pt-2">
                    <p className="text-gray-500 text-xs">
                      Data sourced from IPTV-Org • Open Source Project
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      © {new Date().getFullYear()} Yo TV • For Educational
                      Purposes Only
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Feedback Form Description */}
                  <div className="bg-dark-300/50 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary-400" />
                      Send Us Your Feedback
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Have a suggestion, found a bug, or want to report an
                      issue? We'd love to hear from you! Your feedback helps us
                      improve Yo TV.
                    </p>
                  </div>

                  {/* Success/Error Message */}
                  {submitResult && (
                    <div
                      className={`p-4 rounded-xl flex items-center gap-3 ${
                        submitResult.type === "success"
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-red-500/10 border border-red-500/30"
                      }`}
                    >
                      {submitResult.type === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                      <p
                        className={`text-sm ${
                          submitResult.type === "success"
                            ? "text-green-300"
                            : "text-red-300"
                        }`}
                      >
                        {submitResult.message}
                      </p>
                    </div>
                  )}

                  {/* Feedback Form */}
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          value={feedbackForm.name}
                          onChange={(e) =>
                            setFeedbackForm({
                              ...feedbackForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-dark-300 border border-dark-400 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          maxLength={255}
                          value={feedbackForm.email}
                          onChange={(e) =>
                            setFeedbackForm({
                              ...feedbackForm,
                              email: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-dark-300 border border-dark-400 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                          Subject *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={200}
                          value={feedbackForm.subject}
                          onChange={(e) =>
                            setFeedbackForm({
                              ...feedbackForm,
                              subject: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-dark-300 border border-dark-400 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                          placeholder="Brief subject"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                          Type
                        </label>
                        <select
                          value={feedbackForm.type}
                          onChange={(e) =>
                            setFeedbackForm({
                              ...feedbackForm,
                              type: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-dark-300 border border-dark-400 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                        >
                          <option value="feedback">General Feedback</option>
                          <option value="suggestion">Suggestion</option>
                          <option value="bug">Bug Report</option>
                          <option value="question">Question</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Message *
                      </label>
                      <textarea
                        required
                        maxLength={2000}
                        rows={4}
                        value={feedbackForm.message}
                        onChange={(e) =>
                          setFeedbackForm({
                            ...feedbackForm,
                            message: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 bg-dark-300 border border-dark-400 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none"
                        placeholder="Tell us what's on your mind..."
                      />
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {feedbackForm.message.length}/2000
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white font-medium rounded-xl transition-colors"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Feedback
                        </>
                      )}
                    </button>
                  </form>

                  {/* Privacy Note */}
                  <p className="text-center text-xs text-gray-500">
                    Your feedback is stored securely and used only to improve Yo
                    TV. We respect your privacy.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
