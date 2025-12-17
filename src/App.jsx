/**
 * ============================================================================
 * MUSIC PLAYER APP - Capstone Project
 * Created by: Apiwe Fuziile
 * Cohort: 9
 * ============================================================================
 *
 * This is my music player application built with React and the Deezer API.
 * It allows users to search for songs, play 30-second previews, and save
 * their favorite tracks to localStorage for persistence.
 *
 * Key Features:
 * - Beautiful landing page with smooth transition
 * - Real-time music search using Deezer's free API
 * - Beautiful glassmorphism card design
 * - Now Playing bar with full playback controls
 * - Favorites system with localStorage persistence
 * - Fully responsive design for all screen sizes
 * ============================================================================
 */

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
   */
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Fetch top chart tracks from Deezer
        const response = await axios.get(
          "https://api.deezer.com/chart/0/tracks"
        );
        setTrendingTracks(response.data.data.slice(0, 8));
      } catch (error) {
        console.error("Error fetching trending tracks:", error);
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
   *
   * How it works:
   * 1. Check if the search query is not empty
   * 2. Set loading state to show the spinner
   * 3. Make GET request to Deezer's search endpoint
   * 4. Store the first 12 results in our tracks state
   * 5. Handle any errors gracefully
   */
  const searchMusic = async () => {
    // Don't search if query is empty or just whitespace
    if (!query.trim()) return;

    setLoading(true); // Show loading indicator
    try {
      // Make API request to Deezer
      // encodeURIComponent ensures special characters in the query are properly escaped
      const response = await axios.get(
        `https://api.deezer.com/search?q=${encodeURIComponent(query)}`
      );
      // Take only the first 12 tracks for a clean grid display
      setTracks(response.data.data.slice(0, 12));
    } catch (error) {
      // Log the error for debugging and show user-friendly message
      console.error("Error fetching music:", error);
      alert("Something went wrong. Try again!");
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
  // MAIN MUSIC PLAYER
  // The full music player interface shown after clicking "Enter"
  // Using inline styles for guaranteed compatibility
  // ============================================================================

  // Styles object for cleaner code
  const styles = {
    container: {
      minHeight: "100vh",
      background:
        "linear-gradient(135deg, #0f0a1e 0%, #1a1040 30%, #2d1b4e 60%, #1a1040 100%)",
      color: "white",
      fontFamily: "'Outfit', system-ui, sans-serif",
      paddingBottom: currentTrack ? "100px" : "0",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px 32px",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    },
    logoSection: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    logoIcon: {
      width: "48px",
      height: "48px",
      borderRadius: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
    },
    logoText: {
      fontSize: "24px",
      fontWeight: 500,
      color: "white",
    },
    searchBar: {
      flex: 1,
      maxWidth: "500px",
      margin: "0 32px",
    },
    searchInput: {
      width: "100%",
      padding: "14px 20px 14px 48px",
      borderRadius: "30px",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
      fontSize: "15px",
      outline: "none",
      fontFamily: "'Outfit', system-ui, sans-serif",
    },
    favoritesButton: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "transparent",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    mainContent: {
      padding: "32px",
    },
    sectionLabel: {
      fontSize: "13px",
      fontWeight: 500,
      color: "rgba(255,255,255,0.5)",
      letterSpacing: "1px",
      marginBottom: "20px",
    },
    card: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "16px",
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    iconCircle: {
      width: "48px",
      height: "48px",
      borderRadius: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: 600,
      color: "white",
      margin: 0,
    },
    cardSubtitle: {
      fontSize: "14px",
      color: "rgba(255,255,255,0.5)",
      margin: "4px 0 0 0",
    },
    trackItem: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "12px 0",
      cursor: "pointer",
      borderRadius: "8px",
      transition: "background 0.2s",
    },
    trackImage: {
      width: "48px",
      height: "48px",
      borderRadius: "8px",
      objectFit: "cover",
    },
    trackInfo: {
      flex: 1,
    },
    trackTitle: {
      fontSize: "15px",
      fontWeight: 500,
      color: "white",
      margin: 0,
    },
    trackArtist: {
      fontSize: "13px",
      color: "rgba(255,255,255,0.5)",
      margin: "2px 0 0 0",
    },
  };

  return (
    <div style={styles.container}>
      {/* Hidden audio element for playback */}
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
          HEADER - Logo, Search Bar, Favorites Button
          ================================================================ */}
      <header style={styles.header}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <IoMusicalNote style={{ fontSize: "24px", color: "white" }} />
          </div>
          <span style={styles.logoText}>NovaBeat</span>
        </div>

        {/* Search Bar */}
        <div style={styles.searchBar}>
          <div style={{ position: "relative" }}>
            <FaSearch
              style={{
                position: "absolute",
                left: "18px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.4)",
                fontSize: "16px",
              }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchMusic()}
              placeholder="Search songs, artists, albums..."
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Favorites Button */}
        <button style={styles.favoritesButton}>
          <FaRegHeart style={{ fontSize: "20px" }} />
        </button>
      </header>

      {/* ================================================================
          MAIN CONTENT
          ================================================================ */}
      <main style={styles.mainContent}>
        {/* Loading Indicator */}
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              padding: "40px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                background: "#818cf8",
                borderRadius: "50%",
                animation: "bounce 1s infinite",
              }}
            />
            <div
              style={{
                width: "12px",
                height: "12px",
                background: "#a78bfa",
                borderRadius: "50%",
                animation: "bounce 1s infinite 0.1s",
              }}
            />
            <div
              style={{
                width: "12px",
                height: "12px",
                background: "#ec4899",
                borderRadius: "50%",
                animation: "bounce 1s infinite 0.2s",
              }}
            />
          </div>
        )}

        {/* Search Results */}
        {tracks.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <p style={styles.sectionLabel}>SEARCH RESULTS</p>
            <div style={styles.card}>
              <div style={{ ...styles.cardHeader, marginBottom: "16px" }}>
                <div
                  style={{
                    ...styles.iconCircle,
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  }}
                >
                  <FaSearch style={{ fontSize: "20px", color: "white" }} />
                </div>
                <div>
                  <h3 style={styles.cardTitle}>Search Results</h3>
                  <p style={styles.cardSubtitle}>{tracks.length} songs</p>
                </div>
              </div>
              {tracks.map((track) => (
                <div
                  key={track.id}
                  style={{
                    ...styles.trackItem,
                    background:
                      currentTrack?.id === track.id
                        ? "rgba(139, 92, 246, 0.2)"
                        : "transparent",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                  }}
                  onClick={() => playTrack(track)}
                  onMouseOver={(e) => {
                    if (currentTrack?.id !== track.id) {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentTrack?.id !== track.id) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <img
                    src={track.album.cover_small}
                    alt={track.title}
                    style={styles.trackImage}
                  />
                  <div style={styles.trackInfo}>
                    <p style={styles.trackTitle}>{track.title}</p>
                    <p style={styles.trackArtist}>{track.artist.name}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px",
                    }}
                  >
                    {isFavorite(track.id) ? (
                      <FaHeart style={{ fontSize: "18px", color: "#ec4899" }} />
                    ) : (
                      <FaRegHeart
                        style={{
                          fontSize: "18px",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLAYLISTS Section Label */}
        {!loading && tracks.length === 0 && (
          <>
            <p style={styles.sectionLabel}>PLAYLISTS</p>

            {/* Favorites Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div
                  style={{
                    ...styles.iconCircle,
                    background:
                      "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
                  }}
                >
                  <FaHeart style={{ fontSize: "20px", color: "white" }} />
                </div>
                <div>
                  <h3 style={styles.cardTitle}>Favorites</h3>
                  <p style={styles.cardSubtitle}>{favorites.length} songs</p>
                </div>
              </div>
              {/* Show favorite tracks if any */}
              {favorites.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  {favorites.slice(0, 3).map((track) => (
                    <div
                      key={`fav-${track.id}`}
                      style={{
                        ...styles.trackItem,
                        paddingLeft: "12px",
                        paddingRight: "12px",
                      }}
                      onClick={() => playTrack(track)}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.05)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <img
                        src={track.album.cover_small}
                        alt={track.title}
                        style={styles.trackImage}
                      />
                      <div style={styles.trackInfo}>
                        <p style={styles.trackTitle}>{track.title}</p>
                        <p style={styles.trackArtist}>{track.artist.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recently Played Card */}
            <div style={styles.card}>
              <div
                style={{
                  ...styles.cardHeader,
                  marginBottom: recentlyPlayed.length > 0 ? "16px" : "0",
                }}
              >
                <div
                  style={{
                    ...styles.iconCircle,
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
                  </svg>
                </div>
                <div>
                  <h3 style={styles.cardTitle}>Recently Played</h3>
                  <p style={styles.cardSubtitle}>
                    {recentlyPlayed.length} songs
                  </p>
                </div>
              </div>
              {recentlyPlayed.length > 0 ? (
                recentlyPlayed.slice(0, 3).map((track) => (
                  <div
                    key={`recent-${track.id}`}
                    style={{
                      ...styles.trackItem,
                      paddingLeft: "12px",
                      paddingRight: "12px",
                    }}
                    onClick={() => playTrack(track)}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <img
                      src={track.album.cover_small}
                      alt={track.title}
                      style={styles.trackImage}
                    />
                    <div style={styles.trackInfo}>
                      <p style={styles.trackTitle}>{track.title}</p>
                      <p style={styles.trackArtist}>{track.artist.name}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "14px",
                    marginTop: "12px",
                  }}
                >
                  Play some music to see your history here
                </p>
              )}
            </div>

            {/* Trending Now Card */}
            <div style={styles.card}>
              <div
                style={{
                  ...styles.cardHeader,
                  marginBottom: trendingTracks.length > 0 ? "16px" : "0",
                }}
              >
                <div
                  style={{
                    ...styles.iconCircle,
                    background:
                      "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                  </svg>
                </div>
                <div>
                  <h3 style={styles.cardTitle}>Trending Now</h3>
                  <p style={styles.cardSubtitle}>
                    {trendingTracks.length} songs
                  </p>
                </div>
              </div>
              {trendingTracks.length > 0 ? (
                trendingTracks.slice(0, 3).map((track) => (
                  <div
                    key={`trending-${track.id}`}
                    style={{
                      ...styles.trackItem,
                      paddingLeft: "12px",
                      paddingRight: "12px",
                    }}
                    onClick={() => playTrack(track)}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <img
                      src={track.album.cover_small}
                      alt={track.title}
                      style={styles.trackImage}
                    />
                    <div style={styles.trackInfo}>
                      <p style={styles.trackTitle}>{track.title}</p>
                      <p style={styles.trackArtist}>{track.artist.name}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "14px",
                    marginTop: "12px",
                  }}
                >
                  Loading trending tracks...
                </p>
              )}
            </div>
          </>
        )}
      </main>

      {/* ================================================================
          NOW PLAYING BAR
          Fixed bottom bar showing current track with playback controls
          ================================================================ */}
      {currentTrack && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(15, 10, 30, 0.95)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Progress bar */}
          <div
            style={{
              height: "4px",
              background: "rgba(255,255,255,0.1)",
              cursor: "pointer",
            }}
            onClick={handleProgressClick}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)",
                borderRadius: "2px",
              }}
            />
          </div>

          {/* Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 32px",
              gap: "20px",
            }}
          >
            {/* Track info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flex: 1,
                minWidth: 0,
              }}
            >
              <img
                src={currentTrack.album.cover_small}
                alt={currentTrack.title}
                style={{ width: "56px", height: "56px", borderRadius: "8px" }}
              />
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "white",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentTrack.title}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.5)",
                    margin: "2px 0 0 0",
                  }}
                >
                  {currentTrack.artist.name}
                </p>
              </div>
              <button
                onClick={() => toggleFavorite(currentTrack)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                }}
              >
                {isFavorite(currentTrack.id) ? (
                  <FaHeart style={{ fontSize: "20px", color: "#ec4899" }} />
                ) : (
                  <FaRegHeart
                    style={{ fontSize: "20px", color: "rgba(255,255,255,0.5)" }}
                  />
                )}
              </button>
            </div>

            {/* Playback controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                onClick={playPrevious}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <FaStepBackward style={{ fontSize: "18px" }} />
              </button>
              <button
                onClick={togglePlayPause}
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
                }}
              >
                {isPlaying ? (
                  <FaPause style={{ fontSize: "18px", color: "white" }} />
                ) : (
                  <FaPlay
                    style={{
                      fontSize: "18px",
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
                  padding: "8px",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <FaStepForward style={{ fontSize: "18px" }} />
              </button>
            </div>

            {/* Volume control */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flex: 1,
                justifyContent: "flex-end",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.5)",
                  minWidth: "80px",
                  textAlign: "right",
                }}
              >
                {formatTime(audioRef.current?.currentTime)} /{" "}
                {formatTime(audioRef.current?.duration)}
              </span>
              <button
                onClick={() => setIsMuted(!isMuted)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {isMuted ? (
                  <FaVolumeMute style={{ fontSize: "18px" }} />
                ) : (
                  <FaVolumeUp style={{ fontSize: "18px" }} />
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
                style={{ width: "100px" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
