import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaHeart,
  FaRegHeart,
  FaSearch,
  FaMusic,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import { IoMusicalNote } from "react-icons/io5";

function App() {
  // ============================================================================
  // STATE MANAGEMENT SECTION
  // Here I define all the state variables that control my app's behavior
  // ============================================================================

  // Landing page state - controls whether to show landing or main app
  const [showLanding, setShowLanding] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Search-related state
  const [query, setQuery] = useState(""); // Stores the user's search input
  const [tracks, setTracks] = useState([]); // Stores the search results from Deezer API
  const [loading, setLoading] = useState(false); // Shows loading spinner while fetching

  // Playback-related state
  const [currentTrack, setCurrentTrack] = useState(null); // The currently playing/selected track
  const [isPlaying, setIsPlaying] = useState(false); // Whether audio is currently playing
  const [progress, setProgress] = useState(0); // Current playback progress (0-100%)
  const [volume, setVolume] = useState(0.7); // Volume level (0-1)
  const [isMuted, setIsMuted] = useState(false); // Whether audio is muted

  // Favorites state - I load saved favorites from localStorage on app start
  const [favorites, setFavorites] = useState(() => {
    // This function runs once when the component mounts
    // It retrieves any previously saved favorites from the browser's localStorage
    const saved = localStorage.getItem("musicFavorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Recently played tracks - loaded from localStorage
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    const saved = localStorage.getItem("recentlyPlayed");
    return saved ? JSON.parse(saved) : [];
  });

  // Trending tracks - fetched from Deezer API
  const [trendingTracks, setTrendingTracks] = useState([]);

  // Mobile menu state - controls sidebar visibility on mobile
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // ============================================================================
  // REFS SECTION
  // Refs allow me to directly access DOM elements (like the audio player)
  // ============================================================================

  const audioRef = useRef(null); // Reference to the HTML5 audio element

  // ============================================================================
  // EFFECTS SECTION
  // useEffect hooks handle side effects like saving data and updating progress
  // ============================================================================

  /**
   * EFFECT: Save favorites to localStorage
   * Whenever the favorites array changes, I save it to localStorage
   * This ensures favorites persist even after the browser is closed
   */
  useEffect(() => {
    localStorage.setItem("musicFavorites", JSON.stringify(favorites));
  }, [favorites]);

  /**
   * EFFECT: Save recently played to localStorage
   */
  useEffect(() => {
    localStorage.setItem("recentlyPlayed", JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  /**
   * EFFECT: Fetch trending tracks from Deezer API on mount
   * Using CORS proxy to bypass browser restrictions
   */
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Fetch top chart tracks from Deezer using CORS proxy
        const response = await axios.get(
          "https://corsproxy.io/?https://api.deezer.com/chart/0/tracks"
        );
        setTrendingTracks(response.data.data.slice(0, 10));
      } catch (error) {
        console.error("Error fetching trending tracks:", error);
        // Fallback: try alternative proxy
        try {
          const fallbackResponse = await axios.get(
            "https://api.allorigins.win/raw?url=" +
              encodeURIComponent("https://api.deezer.com/chart/0/tracks")
          );
          const data =
            typeof fallbackResponse.data === "string"
              ? JSON.parse(fallbackResponse.data)
              : fallbackResponse.data;
          setTrendingTracks(data.data.slice(0, 10));
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      }
    };
    fetchTrending();
  }, []);

  /**
   * EFFECT: Update audio volume
   * When volume or mute state changes, I update the audio element
   */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // ============================================================================
  // LANDING PAGE FUNCTIONS
  // Handle the transition from landing page to main app
  // ============================================================================

  /**
   * handleEnterApp - Handles the "Enter" button click with smooth transition
   * Creates a fade-out effect before showing the main music player
   */
  const handleEnterApp = () => {
    setIsTransitioning(true);
    // Wait for fade-out animation, then show main app
    setTimeout(() => {
      setShowLanding(false);
    }, 500);
  };

  // ============================================================================
  // API FUNCTIONS SECTION
  // These functions handle communication with the Deezer API
  // ============================================================================

  /**
   * searchMusic - Fetches songs from Deezer API based on user's search query
   * Using CORS proxy to bypass browser restrictions
   *
   * How it works:
   * 1. Check if the search query is not empty
   * 2. Set loading state to show the spinner
   * 3. Make GET request to Deezer's search endpoint via CORS proxy
   * 4. Store the first 12 results in our tracks state
   * 5. Handle any errors gracefully
   */
  const searchMusic = async () => {
    // Don't search if query is empty or just whitespace
    if (!query.trim()) return;

    setLoading(true); // Show loading indicator
    try {
      // Make API request to Deezer using CORS proxy
      const response = await axios.get(
        `https://corsproxy.io/?https://api.deezer.com/search?q=${encodeURIComponent(
          query
        )}`
      );
      // Take only the first 12 tracks for a clean grid display
      setTracks(response.data.data.slice(0, 12));
    } catch (error) {
      // Log the error for debugging
      console.error("Error fetching music:", error);
      // Try fallback proxy
      try {
        const fallbackResponse = await axios.get(
          "https://api.allorigins.win/raw?url=" +
            encodeURIComponent(
              `https://api.deezer.com/search?q=${encodeURIComponent(query)}`
            )
        );
        const data =
          typeof fallbackResponse.data === "string"
            ? JSON.parse(fallbackResponse.data)
            : fallbackResponse.data;
        setTracks(data.data.slice(0, 12));
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        alert("Something went wrong. Try again!");
      }
    } finally {
      // Always hide loading indicator when done (success or failure)
      setLoading(false);
    }
  };

  // ============================================================================
  // PLAYBACK CONTROL FUNCTIONS
  // These functions control the audio playback experience
  // ============================================================================

  /**
   * playTrack - Starts playing a selected track
   * @param {Object} track - The track object from Deezer API containing preview URL
   *
   * This function:
   * 1. Sets the current track to the selected one
   * 2. Updates the audio source
   * 3. Starts playback
   * 4. Adds track to recently played list
   */
  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);

    // Add to recently played (avoid duplicates, keep most recent at top)
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id);
      return [track, ...filtered].slice(0, 10); // Keep last 10 tracks
    });

    // Wait for state to update, then play the audio
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 100);
  };

  /**
   * togglePlayPause - Toggles between play and pause states
   * Called when user clicks the play/pause button in the Now Playing bar
   */
  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  /**
   * playNext - Plays the next track in the current search results
   * Finds the current track's index and plays the next one
   * Loops back to the first track if at the end
   */
  const playNext = () => {
    if (!currentTrack || tracks.length === 0) return;

    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length; // Loop back to 0 at the end
    playTrack(tracks[nextIndex]);
  };

  /**
   * playPrevious - Plays the previous track in the current search results
   * Loops to the last track if at the beginning
   */
  const playPrevious = () => {
    if (!currentTrack || tracks.length === 0) return;

    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    // If at first track, go to last; otherwise go to previous
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    playTrack(tracks[prevIndex]);
  };

  /**
   * handleTimeUpdate - Updates the progress bar as the song plays
   * Called continuously while audio is playing
   */
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const percentage =
        (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(percentage || 0);
    }
  };

  /**
   * handleProgressClick - Allows users to seek by clicking the progress bar
   * @param {Event} e - The click event
   */
  const handleProgressClick = (e) => {
    if (!audioRef.current) return;

    const progressBar = e.currentTarget;
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
    const percentage = (clickPosition / progressBar.offsetWidth) * 100;
    const newTime = (percentage / 100) * audioRef.current.duration;

    audioRef.current.currentTime = newTime;
    setProgress(percentage);
  };

  // ============================================================================
  // FAVORITES FUNCTIONS
  // These functions manage the user's favorite tracks
  // ============================================================================

  /**
   * toggleFavorite - Adds or removes a track from favorites
   * @param {Object} track - The track to toggle
   *
   * If the track is already favorited, remove it.
   * If not, add it to the favorites array.
   */
  const toggleFavorite = (track) => {
    setFavorites((prev) => {
      const isFavorited = prev.some((fav) => fav.id === track.id);
      if (isFavorited) {
        // Remove from favorites
        return prev.filter((fav) => fav.id !== track.id);
      } else {
        // Add to favorites
        return [...prev, track];
      }
    });
  };

  /**
   * isFavorite - Checks if a track is in the favorites list
   * @param {number} trackId - The ID of the track to check
   * @returns {boolean} - True if the track is favorited
   */
  const isFavorite = (trackId) => favorites.some((fav) => fav.id === trackId);

  /**
   * formatTime - Converts seconds to MM:SS format for display
   * @param {number} seconds - Time in seconds
   * @returns {string} - Formatted time string
   */
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ============================================================================
  // RENDER SECTION
  // This is where I define what the user interface looks like
  // ============================================================================

  // ============================================================================
  // LANDING PAGE COMPONENT
  // Beautiful welcome screen shown when user first opens the app
  // Using inline styles for guaranteed compatibility
  // ============================================================================
  if (showLanding) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #1a1040 0%, #2d1b69 25%, #1e3a5f 50%, #2d1b69 75%, #1a1040 100%)",
          opacity: isTransitioning ? 0 : 1,
          transition: "opacity 0.5s ease",
        }}
      >
        {/* Ambient background glow effects */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: "25%",
              left: "25%",
              width: "400px",
              height: "400px",
              background: "rgba(147, 51, 234, 0.2)",
              borderRadius: "50%",
              filter: "blur(80px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "25%",
              right: "25%",
              width: "400px",
              height: "400px",
              background: "rgba(37, 99, 235, 0.2)",
              borderRadius: "50%",
              filter: "blur(80px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "600px",
              height: "600px",
              background: "rgba(99, 102, 241, 0.1)",
              borderRadius: "50%",
              filter: "blur(100px)",
            }}
          />
        </div>

        {/* Main content container */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          {/* Music note icon with gradient background */}
          <div style={{ marginBottom: "32px" }}>
            <div
              style={{
                width: "112px",
                height: "112px",
                borderRadius: "24px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c4b5fd 100%)",
                boxShadow: "0 25px 50px -12px rgba(147, 51, 234, 0.3)",
              }}
            >
              <IoMusicalNote style={{ fontSize: "48px", color: "white" }} />
            </div>
          </div>

          {/* App name - NovaBeat style */}
          <h1
            style={{
              fontSize: "clamp(56px, 10vw, 96px)",
              fontWeight: 200,
              letterSpacing: "-0.02em",
              marginBottom: "24px",
              color: "#a5b4fc",
              textShadow: "0 0 40px rgba(165, 180, 252, 0.3)",
              fontFamily: "'Outfit', system-ui, sans-serif",
            }}
          >
            NovaBeat
          </h1>

          {/* Tagline description */}
          <p
            style={{
              fontSize: "clamp(18px, 3vw, 24px)",
              color: "rgba(199, 210, 254, 0.8)",
              maxWidth: "500px",
              margin: "0 auto 48px auto",
              lineHeight: 1.6,
              fontWeight: 300,
              fontFamily: "'Outfit', system-ui, sans-serif",
            }}
          >
            Experience music in a whole new dimension. Your personal futuristic
            music player.
          </p>

          {/* Enter button with glassmorphism effect */}
          <button
            onClick={handleEnterApp}
            style={{
              padding: "20px 48px",
              borderRadius: "16px",
              fontSize: "18px",
              fontWeight: 500,
              cursor: "pointer",
              marginBottom: "64px",
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#c7d2fe",
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              transition: "all 0.3s ease",
              fontFamily: "'Outfit', system-ui, sans-serif",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Enter NovaBeat
          </button>

          {/* Feature badges */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "32px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#f472b6",
                }}
              />
              <span
                style={{
                  color: "rgba(199, 210, 254, 0.7)",
                  fontSize: "14px",
                  fontWeight: 300,
                  fontFamily: "'Outfit', system-ui, sans-serif",
                }}
              >
                Smart Playlists
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#60a5fa",
                }}
              />
              <span
                style={{
                  color: "rgba(199, 210, 254, 0.7)",
                  fontSize: "14px",
                  fontWeight: 300,
                  fontFamily: "'Outfit', system-ui, sans-serif",
                }}
              >
                HD Audio
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#a78bfa",
                }}
              />
              <span
                style={{
                  color: "rgba(199, 210, 254, 0.7)",
                  fontSize: "14px",
                  fontWeight: 300,
                  fontFamily: "'Outfit', system-ui, sans-serif",
                }}
              >
                Offline Mode
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN MUSIC PLAYER - 3 Column Layout
  // Left: Playlists | Center: All Songs | Right: Now Playing
  // ============================================================================

  // Get all songs to display (search results or trending)
  const displayTracks = tracks.length > 0 ? tracks : trendingTracks;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f0a1e 0%, #1a1040 30%, #2d1b4e 60%, #1a1040 100%)",
        color: "white",
        fontFamily: "'Outfit', system-ui, sans-serif",
      }}
    >
      {/* Hidden audio element */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.preview}
          onTimeUpdate={handleTimeUpdate}
          onEnded={playNext}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* ================================================================
          HEADER
          ================================================================ */}
      <header
        className="app-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              color: "white",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
            }}
          >
            <IoMusicalNote style={{ fontSize: "22px", color: "white" }} />
          </div>
          <span style={{ fontSize: "22px", fontWeight: 500 }}>NovaBeat</span>
        </div>

        <div
          className="search-container"
          style={{ flex: 1, maxWidth: "500px", margin: "0 24px" }}
        >
          <div style={{ position: "relative" }}>
            <FaSearch
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.4)",
              }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchMusic()}
              placeholder="Search songs, artists, albums..."
              style={{
                width: "100%",
                padding: "12px 16px 12px 44px",
                borderRadius: "25px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                fontSize: "14px",
                outline: "none",
                fontFamily: "'Outfit', system-ui, sans-serif",
              }}
            />
          </div>
        </div>

        <button
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaRegHeart style={{ fontSize: "18px" }} />
        </button>
      </header>

      {/* ================================================================
          MAIN 3-COLUMN LAYOUT
          ================================================================ */}
      <div
        className="main-grid-layout"
        style={{
          display: "grid",
          gridTemplateColumns: currentTrack ? "280px 1fr 300px" : "280px 1fr",
          minHeight: "calc(100vh - 77px)",
        }}
      >
        {/* ============================================================
            LEFT SIDEBAR - Playlists
            ============================================================ */}
        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div
            className="mobile-menu-overlay"
            onClick={() => setShowMobileMenu(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 998,
              display: "none",
            }}
          />
        )}

        <aside
          className={`left-sidebar ${showMobileMenu ? "mobile-menu-open" : ""}`}
          style={{
            padding: "24px 16px",
            borderRight: "1px solid rgba(255,255,255,0.05)",
            overflowY: "auto",
          }}
        >
          {/* Mobile Close Button */}
          <button
            className="mobile-close-btn"
            onClick={() => setShowMobileMenu(false)}
            style={{
              display: "none",
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              color: "white",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>

          <p
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "1px",
              marginBottom: "16px",
            }}
          >
            PLAYLISTS
          </p>

          {/* Favorites Card */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "12px",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
                }}
              >
                <FaHeart style={{ fontSize: "16px", color: "white" }} />
              </div>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 500, margin: 0 }}>
                  Favorites
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.5)",
                    margin: "2px 0 0 0",
                  }}
                >
                  {favorites.length} songs
                </p>
              </div>
            </div>
          </div>

          {/* Recently Played Card */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: recentlyPlayed.length > 0 ? "12px" : "0",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 500, margin: 0 }}>
                  Recently Played
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.5)",
                    margin: "2px 0 0 0",
                  }}
                >
                  {recentlyPlayed.length} songs
                </p>
              </div>
            </div>
            {recentlyPlayed.slice(0, 3).map((track) => (
              <div
                key={`recent-${track.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginTop: "4px",
                }}
                onClick={() => {
                  playTrack(track);
                  setShowMobileMenu(false);
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <img
                  src={track.album.cover_small}
                  alt={track.title}
                  style={{ width: "36px", height: "36px", borderRadius: "6px" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {track.title}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.5)",
                      margin: 0,
                    }}
                  >
                    {track.artist.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Trending Now Card */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: trendingTracks.length > 0 ? "12px" : "0",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 500, margin: 0 }}>
                  Trending Now
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.5)",
                    margin: "2px 0 0 0",
                  }}
                >
                  {trendingTracks.length} songs
                </p>
              </div>
            </div>
            {trendingTracks.slice(0, 3).map((track) => (
              <div
                key={`trending-${track.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginTop: "4px",
                }}
                onClick={() => {
                  playTrack(track);
                  setShowMobileMenu(false);
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <img
                  src={track.album.cover_small}
                  alt={track.title}
                  style={{ width: "36px", height: "36px", borderRadius: "6px" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {track.title}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.5)",
                      margin: 0,
                    }}
                  >
                    {track.artist.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ============================================================
            CENTER - All Songs List
            ============================================================ */}
        <main
          className="main-content"
          style={{ padding: "24px", overflowY: "auto" }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="rgba(255,255,255,0.6)"
              >
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
              </svg>
              <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
                {tracks.length > 0 ? "Search Results" : "All Songs"}
              </h2>
            </div>

            {loading && (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "rgba(255,255,255,0.5)" }}>Loading...</p>
              </div>
            )}

            {!loading &&
              displayTracks.map((track) => (
                <div
                  key={track.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    marginBottom: "4px",
                    background:
                      currentTrack?.id === track.id
                        ? "rgba(139, 92, 246, 0.2)"
                        : "transparent",
                  }}
                  onClick={() => playTrack(track)}
                  onMouseOver={(e) => {
                    if (currentTrack?.id !== track.id)
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)";
                  }}
                  onMouseOut={(e) => {
                    if (currentTrack?.id !== track.id)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <img
                      src={track.album.cover_small}
                      alt={track.title}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "8px",
                      }}
                    />
                    {currentTrack?.id === track.id && isPlaying && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.5)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "2px",
                            alignItems: "flex-end",
                          }}
                        >
                          <div
                            style={{
                              width: "3px",
                              height: "12px",
                              background: "#8b5cf6",
                              borderRadius: "2px",
                              animation: "pulse 0.5s infinite alternate",
                            }}
                          />
                          <div
                            style={{
                              width: "3px",
                              height: "16px",
                              background: "#8b5cf6",
                              borderRadius: "2px",
                              animation: "pulse 0.5s infinite alternate 0.1s",
                            }}
                          />
                          <div
                            style={{
                              width: "3px",
                              height: "10px",
                              background: "#8b5cf6",
                              borderRadius: "2px",
                              animation: "pulse 0.5s infinite alternate 0.2s",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 500,
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {track.title}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.5)",
                        margin: "2px 0 0 0",
                      }}
                    >
                      {track.artist.name} • {track.album.title}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {Math.floor(track.duration / 60)}:
                      {(track.duration % 60).toString().padStart(2, "0")}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                    >
                      {isFavorite(track.id) ? (
                        <FaHeart
                          style={{ fontSize: "16px", color: "#ec4899" }}
                        />
                      ) : (
                        <FaRegHeart
                          style={{
                            fontSize: "16px",
                            color: "rgba(255,255,255,0.3)",
                          }}
                        />
                      )}
                    </button>
                  </div>
                </div>
              ))}

            {!loading && displayTracks.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "rgba(255,255,255,0.5)" }}>
                  No songs found. Try searching for something!
                </p>
              </div>
            )}
          </div>
        </main>

        {/* ============================================================
            RIGHT SIDEBAR - Now Playing
            ============================================================ */}
        {currentTrack && (
          <aside
            className="now-playing-sidebar"
            style={{
              padding: "24px 16px",
              borderLeft: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Album Art */}
            <img
              src={currentTrack.album.cover_medium}
              alt={currentTrack.title}
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "16px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                marginBottom: "24px",
              }}
            />

            {/* Track Info */}
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 600,
                margin: "0 0 4px 0",
                textAlign: "center",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {currentTrack.title}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.6)",
                margin: "0 0 4px 0",
                textAlign: "center",
              }}
            >
              {currentTrack.artist.name}
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.4)",
                margin: "0 0 24px 0",
                textAlign: "center",
              }}
            >
              {currentTrack.album.title}
            </p>

            {/* Progress Bar */}
            <div style={{ width: "100%", marginBottom: "8px" }}>
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
                onClick={handleProgressClick}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background:
                      "linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)",
                    borderRadius: "2px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: "-6px",
                      top: "-4px",
                      width: "12px",
                      height: "12px",
                      background: "white",
                      borderRadius: "50%",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Time */}
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <span
                style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}
              >
                {formatTime(audioRef.current?.currentTime)}
              </span>
              <span
                style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}
              >
                -
                {formatTime(
                  (audioRef.current?.duration || 0) -
                    (audioRef.current?.currentTime || 0)
                )}
              </span>
            </div>

            {/* Playback Controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                marginBottom: "32px",
              }}
            >
              <button
                onClick={playPrevious}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <FaStepBackward style={{ fontSize: "20px" }} />
              </button>
              <button
                onClick={togglePlayPause}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                }}
              >
                {isPlaying ? (
                  <FaPause style={{ fontSize: "20px", color: "white" }} />
                ) : (
                  <FaPlay
                    style={{
                      fontSize: "20px",
                      color: "white",
                      marginLeft: "3px",
                    }}
                  />
                )}
              </button>
              <button
                onClick={playNext}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <FaStepForward style={{ fontSize: "20px" }} />
              </button>
            </div>

            {/* Volume Control */}
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setIsMuted(!isMuted)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {isMuted ? (
                  <FaVolumeMute style={{ fontSize: "16px" }} />
                ) : (
                  <FaVolumeUp style={{ fontSize: "16px" }} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                style={{ flex: 1, accentColor: "#8b5cf6" }}
              />
              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.5)",
                  minWidth: "35px",
                }}
              >
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </aside>
        )}
      </div>

      {/* Comprehensive Responsive Styles */}
      <style>{`
        /* Tablet Styles (768px - 1024px) */
        @media (max-width: 1024px) {
          .main-grid-layout {
            grid-template-columns: 240px 1fr !important;
          }
          
          .now-playing-sidebar {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-height: 50vh !important;
            border-left: none !important;
            border-top: 1px solid rgba(255,255,255,0.1) !important;
            background: rgba(15, 10, 30, 0.98) !important;
            backdrop-filter: blur(20px) !important;
            z-index: 1000 !important;
            overflow-y: auto !important;
            padding: 16px !important;
          }
          
          .app-header {
            padding: 12px 16px !important;
          }
          
          .search-container {
            margin: 0 12px !important;
          }
          
          .left-sidebar {
            padding: 16px 12px !important;
          }
          
          .main-content {
            padding: 16px !important;
          }
        }
        
        /* Mobile Styles (< 768px) */
        @media (max-width: 768px) {
          .main-grid-layout {
            grid-template-columns: 1fr !important;
            min-height: calc(100vh - 65px) !important;
          }
          
          .app-header {
            flex-wrap: wrap !important;
            padding: 12px !important;
            gap: 12px !important;
          }
          
          .app-header > div:first-child {
            font-size: 18px !important;
          }
          
          .app-header > div:first-child > div {
            width: 36px !important;
            height: 36px !important;
          }
          
          .app-header > div:first-child > div > svg {
            font-size: 18px !important;
          }
          
          .search-container {
            order: 3 !important;
            flex: 1 1 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            margin-top: 8px !important;
          }
          
          .search-container input {
            font-size: 14px !important;
            padding: 10px 14px 10px 40px !important;
          }
          
          .mobile-menu-btn {
            display: block !important;
          }
          
          .left-sidebar {
            position: fixed !important;
            top: 65px !important;
            left: -100% !important;
            width: 280px !important;
            height: calc(100vh - 65px) !important;
            background: rgba(15, 10, 30, 0.98) !important;
            backdrop-filter: blur(20px) !important;
            z-index: 999 !important;
            transition: left 0.3s ease !important;
            border-right: 1px solid rgba(255,255,255,0.1) !important;
            box-shadow: 2px 0 20px rgba(0,0,0,0.3) !important;
          }
          
          .left-sidebar.mobile-menu-open {
            left: 0 !important;
          }
          
          .mobile-menu-overlay {
            display: block !important;
          }
          
          .mobile-close-btn {
            display: block !important;
          }
          
          .main-content {
            padding: 12px !important;
          }
          
          .main-content > div {
            padding: 16px !important;
          }
          
          .main-content h2 {
            font-size: 18px !important;
          }
          
          .now-playing-sidebar {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-height: 60vh !important;
            border-left: none !important;
            border-top: 1px solid rgba(255,255,255,0.1) !important;
            background: rgba(15, 10, 30, 0.98) !important;
            backdrop-filter: blur(20px) !important;
            z-index: 1000 !important;
            overflow-y: auto !important;
            padding: 16px 12px !important;
          }
          
          .now-playing-sidebar img {
            width: 150px !important;
            height: 150px !important;
            margin-bottom: 16px !important;
          }
          
          .now-playing-sidebar h3 {
            font-size: 18px !important;
          }
          
          .now-playing-sidebar > div:last-child {
            gap: 8px !important;
          }
          
          .now-playing-sidebar button {
            width: 48px !important;
            height: 48px !important;
          }
          
          .now-playing-sidebar button svg {
            font-size: 16px !important;
          }
        }
        
        /* Small Mobile (< 480px) */
        @media (max-width: 480px) {
          .app-header {
            padding: 10px !important;
          }
          
          .app-header > div:first-child {
            font-size: 16px !important;
          }
          
          .app-header > div:first-child > div {
            width: 32px !important;
            height: 32px !important;
          }
          
          .search-container input {
            font-size: 13px !important;
            padding: 8px 12px 8px 36px !important;
          }
          
          .main-content {
            padding: 8px !important;
          }
          
          .main-content > div {
            padding: 12px !important;
          }
          
          .main-content > div > div {
            padding: 8px !important;
            gap: 10px !important;
          }
          
          .main-content img {
            width: 40px !important;
            height: 40px !important;
          }
          
          .main-content p {
            font-size: 13px !important;
          }
          
          .now-playing-sidebar {
            padding: 12px 8px !important;
            max-height: 70vh !important;
          }
          
          .now-playing-sidebar img {
            width: 120px !important;
            height: 120px !important;
          }
          
          .now-playing-sidebar h3 {
            font-size: 16px !important;
          }
          
          .now-playing-sidebar > div:nth-child(2) {
            font-size: 12px !important;
          }
          
          .now-playing-sidebar > div:nth-child(3) {
            font-size: 11px !important;
          }
        }
        
        /* Landscape Mobile */
        @media (max-width: 768px) and (orientation: landscape) {
          .now-playing-sidebar {
            max-height: 80vh !important;
          }
        }
        
        /* Large Desktop (> 1400px) */
        @media (min-width: 1400px) {
          .left-sidebar {
            padding: 32px 20px !important;
          }
          
          .main-content {
            padding: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
