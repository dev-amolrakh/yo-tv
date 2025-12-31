import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Play,
  Pause,
  AlertCircle,
  RotateCcw,
  RotateCw,
  Settings,
  PictureInPicture,
  Volume1,
  Volume,
  Loader2,
} from "lucide-react";

function VideoPlayer({ streamUrl, title, referrer, userAgent }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const lastTapRef = useRef(null);
  const tapTimeoutRef = useRef(null);

  // Player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState("auto");
  const [availableQualities, setAvailableQualities] = useState([]);
  const [doubleTapSide, setDoubleTapSide] = useState(null); // 'left' or 'right'

  // Initialize HLS player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    const initPlayer = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90, // Keep 90s of buffer
          maxBufferLength: 30, // Max buffer ahead
          maxMaxBufferLength: 600,
          maxBufferSize: 60 * 1000 * 1000, // 60MB
          maxBufferHole: 0.5,
          highBufferWatchdogPeriod: 2,
          nudgeMaxRetry: 3,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 2,
          levelLoadingTimeOut: 10000,
          levelLoadingMaxRetry: 2,
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 3,
          startLevel: -1, // Auto start level for faster initial load
          abrEwmaDefaultEstimate: 500000, // Start with lower estimate for faster startup
          xhrSetup: (xhr, url) => {
            if (referrer) xhr.setRequestHeader("Referer", referrer);
            if (userAgent) xhr.setRequestHeader("User-Agent", userAgent);
          },
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          setIsLoading(false);
          video.play().catch(() => {});

          // Set available quality levels
          if (hls.levels.length > 0) {
            const qualities = hls.levels
              .map((level, index) => {
                // Calculate quality label
                let label = "";
                if (level.height && level.height > 0) {
                  label = `${level.height}p`;
                } else if (level.width && level.width > 0) {
                  label = `${level.width}w`;
                } else if (level.bitrate) {
                  // Convert bitrate to Mbps
                  const mbps = (level.bitrate / 1000000).toFixed(1);
                  label = `${mbps} Mbps`;
                } else {
                  label = `Quality ${index + 1}`;
                }

                return {
                  index,
                  height: level.height || 0,
                  width: level.width || 0,
                  bitrate: level.bitrate || 0,
                  label,
                };
              })
              .filter((q) => q.label); // Filter out invalid qualities

            setAvailableQualities(qualities);
            console.log("Available qualities:", qualities);
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError(
                  "Network error. Stream may be unavailable or blocked by CORS."
                );
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError("Media error. Attempting to recover...");
                hls.recoverMediaError();
                break;
              default:
                setError("An error occurred while loading the stream.");
                hls.destroy();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", () => {
          setIsLoading(false);
          video.play().catch(() => {});
        });
      } else {
        setError("Your browser does not support HLS streaming.");
      }
    };

    initPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [streamUrl, referrer, userAgent]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("volumechange", handleVolumeChange);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, []);

  // Fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying && showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT") return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          changeVolume(0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          changeVolume(-0.1);
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Control functions
  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
  };

  const changeVolume = (delta) => {
    const video = videoRef.current;
    const newVolume = Math.max(0, Math.min(1, video.volume + delta));
    video.volume = newVolume;
    if (newVolume > 0) video.muted = false;
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    if (newVolume > 0) video.muted = false;
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    video.currentTime = Math.max(
      0,
      Math.min(video.duration, video.currentTime + seconds)
    );
  };

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP error:", err);
    }
  };

  const changePlaybackSpeed = (speed) => {
    const video = videoRef.current;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettings(false);
  };

  const changeQuality = (levelIndex) => {
    if (hlsRef.current && levelIndex !== -1) {
      hlsRef.current.currentLevel = levelIndex;
      const selectedQuality = availableQualities.find(
        (q) => q.index === levelIndex
      );
      setQuality(selectedQuality?.label || "auto");
    } else if (hlsRef.current) {
      hlsRef.current.currentLevel = -1;
      setQuality("auto");
    }
    setShowSettings(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Handle double-tap for mobile
  const handleVideoTap = (e) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.changedTouches?.[0]?.clientX || e.clientX;
    if (!x) return;

    const tapX = x - rect.left;
    const containerWidth = rect.width;
    const side = tapX < containerWidth / 2 ? "left" : "right";

    const now = Date.now();
    const lastTap = lastTapRef.current;

    if (lastTap && now - lastTap.time < 300 && lastTap.side === side) {
      // Double tap detected
      e.preventDefault();
      e.stopPropagation();

      if (side === "left") {
        skip(-10);
      } else {
        skip(10);
      }

      // Show visual feedback
      setDoubleTapSide(side);
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      tapTimeoutRef.current = setTimeout(() => {
        setDoubleTapSide(null);
      }, 500);

      lastTapRef.current = null;
    } else {
      // First tap
      lastTapRef.current = { time: now, side };
      setTimeout(() => {
        if (lastTapRef.current && lastTapRef.current.time === now) {
          // Single tap - toggle play/pause
          togglePlay();
          lastTapRef.current = null;
        }
      }, 300);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.3) return Volume;
    if (volume < 0.7) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  if (!streamUrl) {
    return (
      <div
        className="relative w-full bg-black rounded-xl overflow-hidden"
        style={{ paddingTop: "56.25%" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-400">
              No stream available for this channel
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-xl overflow-hidden group"
      style={{ paddingTop: "56.25%" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
      onClick={(e) => {
        // Only handle click on desktop
        if (window.innerWidth >= 768) {
          togglePlay();
        }
      }}
      onTouchEnd={handleVideoTap}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full"
        playsInline
      />

      {/* Double Tap Feedback - Left Side */}
      {doubleTapSide === "left" && (
        <div className="md:hidden absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-center bg-black/30 pointer-events-none animate-pulse">
          <div className="bg-black/70 rounded-full p-4">
            <RotateCcw className="w-12 h-12 text-white" />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
              10
            </span>
          </div>
        </div>
      )}

      {/* Double Tap Feedback - Right Side */}
      {doubleTapSide === "right" && (
        <div className="md:hidden absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-center bg-black/30 pointer-events-none animate-pulse">
          <div className="bg-black/70 rounded-full p-4">
            <RotateCw className="w-12 h-12 text-white" />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
              10
            </span>
          </div>
        </div>
      )}

      {/* Center Play/Pause Overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
          showControls && !isLoading ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
          {isPlaying ? (
            <Pause className="w-16 h-16 text-white" />
          ) : (
            <Play className="w-16 h-16 text-white" />
          )}
        </div>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            <p className="mt-4 text-white text-sm">Loading stream...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="text-center p-6 max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 mb-2 font-medium">{error}</p>
            <p className="text-gray-400 text-sm">
              Some streams may not work due to CORS restrictions or geographic
              limitations.
            </p>
          </div>
        </div>
      )}

      {/* Title Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <h2 className="text-white text-lg font-semibold truncate">{title}</h2>
      </div>

      {/* Bottom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className="px-4 pb-2">
          <div
            ref={progressBarRef}
            className="relative h-1 bg-gray-600/50 rounded-full cursor-pointer group/progress hover:h-1.5 transition-all"
            onClick={handleProgressClick}
          >
            {/* Buffered */}
            <div
              className="absolute h-full bg-gray-400/50 rounded-full"
              style={{ width: `${(buffered / duration) * 100}%` }}
            />
            {/* Progress */}
            <div
              className="absolute h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="px-2 md:px-4 pb-2 md:pb-4 bg-gradient-to-t from-black/90 to-transparent">
          <div className="flex items-center justify-between gap-1 md:gap-2">
            {/* Left Controls */}
            <div className="flex items-center gap-0.5 md:gap-1">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={isPlaying ? "Pause (k)" : "Play (k)"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 md:w-5 md:h-5 text-white" />
                ) : (
                  <Play className="w-4 h-4 md:w-5 md:h-5 text-white" />
                )}
              </button>

              {/* Skip Back */}
              <button
                onClick={() => skip(-10)}
                className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg transition-colors relative group"
                title="Rewind 10s (←)"
              >
                <RotateCcw className="w-4 h-4 md:w-5 md:h-5 text-white" />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] md:text-[9px] font-bold text-white pointer-events-none">
                  10
                </span>
              </button>

              {/* Skip Forward */}
              <button
                onClick={() => skip(10)}
                className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg transition-colors relative group"
                title="Forward 10s (→)"
              >
                <RotateCw className="w-4 h-4 md:w-5 md:h-5 text-white" />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] md:text-[9px] font-bold text-white pointer-events-none">
                  10
                </span>
              </button>

              {/* Volume Control */}
              <div
                className="hidden md:flex items-center relative"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title={isMuted ? "Unmute (m)" : "Mute (m)"}
                >
                  <VolumeIcon className="w-5 h-5 text-white" />
                </button>

                {/* Volume Slider */}
                <div
                  className={`relative flex items-center transition-all duration-200 ${
                    showVolumeSlider
                      ? "opacity-100 w-24 ml-2"
                      : "opacity-0 w-0 ml-0 pointer-events-none"
                  }`}
                >
                  <div className="w-full h-4 flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #f97316 0%, #f97316 ${
                          volume * 100
                        }%, #4b5563 ${volume * 100}%, #4b5563 100%)`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Time */}
              <div className="text-white text-xs md:text-sm font-medium ml-1 md:ml-2 transition-all duration-200">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-0.5 md:gap-1 relative">
              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </button>

                {/* Settings Menu */}
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-sm rounded-lg overflow-hidden min-w-[200px] shadow-xl border border-gray-700">
                    {/* Playback Speed */}
                    <div className="p-3 border-b border-gray-700">
                      <div className="text-gray-400 text-xs font-semibold mb-2">
                        PLAYBACK SPEED
                      </div>
                      <div className="space-y-1">
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(
                          (speed) => (
                            <button
                              key={speed}
                              onClick={() => changePlaybackSpeed(speed)}
                              className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                                playbackSpeed === speed
                                  ? "bg-primary-500 text-white"
                                  : "text-gray-300 hover:bg-white/10"
                              }`}
                            >
                              {speed === 1 ? "Normal" : `${speed}x`}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Quality */}
                    <div className="p-3">
                      <div className="text-gray-400 text-xs font-semibold mb-2">
                        QUALITY
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={() => changeQuality(-1)}
                          className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                            quality === "auto"
                              ? "bg-primary-500 text-white"
                              : "text-gray-300 hover:bg-white/10"
                          }`}
                        >
                          Auto
                          {availableQualities.length > 0 &&
                            ` (${availableQualities.length} levels)`}
                        </button>
                        {availableQualities.length > 0 ? (
                          availableQualities.map((q) => (
                            <button
                              key={q.index}
                              onClick={() => changeQuality(q.index)}
                              className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                                quality === q.label
                                  ? "bg-primary-500 text-white"
                                  : "text-gray-300 hover:bg-white/10"
                              }`}
                            >
                              {q.label}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-xs text-gray-500">
                            No manual quality options available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Picture-in-Picture */}
              <button
                onClick={togglePiP}
                className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Picture-in-Picture (i)"
              >
                <PictureInPicture className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={isFullscreen ? "Exit Fullscreen (f)" : "Fullscreen (f)"}
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 md:w-5 md:h-5 text-white" />
                ) : (
                  <Maximize className="w-4 h-4 md:w-5 md:h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
