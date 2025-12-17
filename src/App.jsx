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
   */
  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
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
  // ============================================================================
  if (showLanding) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-opacity duration-500 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
        style={{
          background:
            "linear-gradient(135deg, #1a1040 0%, #2d1b69 25%, #1e3a5f 50%, #2d1b69 75%, #1a1040 100%)",
        }}
      >
        {/* Ambient background glow effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Main content container */}
        <div className="relative z-10 text-center px-6">
          {/* Music note icon with gradient background */}
          <div className="mb-8 inline-block">
            <div
              className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30"
              style={{
                background:
                  "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c4b5fd 100%)",
              }}
            >
              <IoMusicalNote className="text-5xl text-white" />
            </div>
          </div>

          {/* App name - NovaBeat style */}
          <h1
            className="text-7xl md:text-8xl font-extralight tracking-tight mb-6"
            style={{
              color: "#a5b4fc",
              textShadow: "0 0 40px rgba(165, 180, 252, 0.3)",
            }}
          >
            NovaBeat
          </h1>

          {/* Tagline description */}
          <p className="text-xl md:text-2xl text-indigo-200/80 max-w-lg mx-auto mb-12 leading-relaxed font-light">
            Experience music in a whole new dimension. Your personal futuristic
            music player.
          </p>

          {/* Enter button with glassmorphism effect */}
          <button
            onClick={handleEnterApp}
            className="group relative px-12 py-5 rounded-2xl font-medium text-lg transition-all duration-300 hover:scale-105 mb-16"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#c7d2fe",
            }}
          >
            <span className="flex items-center gap-3">
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Enter NovaBeat
            </span>
          </button>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-400"></div>
              <span className="text-indigo-200/70 text-sm font-light">
                Smart Playlists
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-indigo-200/70 text-sm font-light">
                HD Audio
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              <span className="text-indigo-200/70 text-sm font-light">
                Offline Mode
              </span>
            </div>
          </div>
        </div>

        {/* Subtle animated particles/dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN MUSIC PLAYER
  // The full music player interface shown after clicking "Enter"
  // ============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white font-sans animate-fadeIn">
      {/* ================================================================
          HIDDEN AUDIO ELEMENT
          This is the actual audio player - hidden because I use custom controls
          ================================================================ */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.preview}
          onTimeUpdate={handleTimeUpdate}
          onEnded={playNext} // Auto-play next track when current ends
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* ================================================================
          MAIN CONTENT CONTAINER
          Contains the header, search, and music grid
          pb-32 adds padding at bottom to prevent Now Playing bar overlap
          ================================================================ */}
      <div className="container mx-auto px-4 py-8 pb-32">
        {/* ==============================================================
            HEADER SECTION
            App title with music icon and animated gradient text
            ============================================================== */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30"
              style={{
                background:
                  "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c4b5fd 100%)",
              }}
            >
              <IoMusicalNote className="text-3xl text-white" />
            </div>
          </div>
          <h1
            className="text-5xl md:text-6xl font-extralight tracking-tight mb-2"
            style={{ color: "#a5b4fc" }}
          >
            NovaBeat
          </h1>
          <p className="text-slate-400 mt-3 text-lg">
            Discover & play your favorite music
          </p>
        </header>

        {/* ==============================================================
            SEARCH BAR SECTION
            Input field with search button - uses glassmorphism styling
            ============================================================== */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-3 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex-1 flex items-center gap-3 px-4">
              <FaSearch className="text-slate-400 text-xl" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchMusic()}
                placeholder="Search songs, artists, albums..."
                className="flex-1 bg-transparent py-4 text-lg outline-none placeholder:text-slate-500"
              />
            </div>
            <button
              onClick={searchMusic}
              className="px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/25"
              style={{
                background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)",
              }}
            >
              Search
            </button>
          </div>
        </div>

        {/* ==============================================================
            LOADING INDICATOR
            Shows animated dots while waiting for API response
            ============================================================== */}
        {loading && (
          <div className="flex justify-center items-center gap-2 mb-8">
            <div
              className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        )}

        {/* ==============================================================
            FAVORITES SECTION
            Shows user's saved favorite tracks (only if they have any)
            ============================================================== */}
        {favorites.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaHeart className="text-pink-400" />
              <span className="text-indigo-200">Your Favorites</span>
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {favorites.map((track) => (
                <div
                  key={`fav-${track.id}`}
                  onClick={() => playTrack(track)}
                  className={`flex-shrink-0 w-40 cursor-pointer group ${
                    currentTrack?.id === track.id
                      ? "ring-2 ring-indigo-400 rounded-xl"
                      : ""
                  }`}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={track.album.cover_medium}
                      alt={track.title}
                      className="w-40 h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                        <FaPlay className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-medium truncate">
                    {track.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {track.artist.name}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==============================================================
            SEARCH RESULTS GRID
            Displays the tracks returned from the Deezer API search
            Uses CSS Grid for responsive layout (2-6 columns based on screen)
            ============================================================== */}
        {tracks.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-slate-300">
              Search Results
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className={`group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/10 hover:shadow-xl hover:shadow-indigo-500/10 ${
                    currentTrack?.id === track.id
                      ? "ring-2 ring-indigo-400 bg-indigo-500/10"
                      : ""
                  }`}
                >
                  {/* Album cover with play overlay */}
                  <div
                    className="relative cursor-pointer"
                    onClick={() => playTrack(track)}
                  >
                    <img
                      src={track.album.cover_medium}
                      alt={track.title}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Play button overlay - appears on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                        {currentTrack?.id === track.id && isPlaying ? (
                          <FaPause className="text-white text-xl" />
                        ) : (
                          <FaPlay className="text-white text-xl ml-1" />
                        )}
                      </div>
                    </div>
                    {/* Currently playing indicator */}
                    {currentTrack?.id === track.id && isPlaying && (
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        <div className="w-1 h-4 bg-indigo-400 rounded animate-pulse"></div>
                        <div
                          className="w-1 h-4 bg-indigo-400 rounded animate-pulse"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-1 h-4 bg-indigo-400 rounded animate-pulse"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Track info and favorite button */}
                  <div className="p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">
                          {track.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate mt-1">
                          {track.artist.name}
                        </p>
                      </div>
                      {/* Favorite/Like button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering play
                          toggleFavorite(track);
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        {isFavorite(track.id) ? (
                          <FaHeart className="text-pink-400 text-lg" />
                        ) : (
                          <FaRegHeart className="text-slate-400 hover:text-pink-400 text-lg transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==============================================================
            EMPTY STATE
            Shows helpful message when search returns no results
            ============================================================== */}
        {!loading && tracks.length === 0 && !query && (
          <div className="text-center py-20">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-30"
              style={{
                background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)",
              }}
            >
              <IoMusicalNote className="text-4xl text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-400 mb-2">
              Start by searching for music
            </h3>
            <p className="text-slate-500">
              Search for your favorite songs, artists, or albums
            </p>
          </div>
        )}

        {!loading && tracks.length === 0 && query && (
          <div className="text-center py-20">
            <p className="text-xl text-slate-400">
              No results found for "{query}". Try something else!
            </p>
          </div>
        )}
      </div>

      {/* ================================================================
          NOW PLAYING BAR
          Fixed bottom bar showing current track with full playback controls
          Only visible when a track is selected
          ================================================================ */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
          {/* Progress bar - clickable to seek */}
          <div
            className="h-1 bg-slate-800 cursor-pointer group"
            onClick={handleProgressClick}
          >
            <div
              className="h-full relative"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #818cf8 0%, #a78bfa 100%)",
              }}
            >
              {/* Seek handle - visible on hover */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"></div>
            </div>
          </div>

          {/* Player controls container */}
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              {/* Current track info (left side) */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img
                  src={currentTrack.album.cover_small}
                  alt={currentTrack.title}
                  className="w-14 h-14 rounded-lg shadow-lg"
                />
                <div className="min-w-0">
                  <h4 className="font-bold truncate">{currentTrack.title}</h4>
                  <p className="text-sm text-slate-400 truncate">
                    {currentTrack.artist.name}
                  </p>
                </div>
                {/* Favorite button in now playing bar */}
                <button
                  onClick={() => toggleFavorite(currentTrack)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block"
                >
                  {isFavorite(currentTrack.id) ? (
                    <FaHeart className="text-pink-400 text-xl" />
                  ) : (
                    <FaRegHeart className="text-slate-400 hover:text-pink-400 text-xl transition-colors" />
                  )}
                </button>
              </div>

              {/* Playback controls (center) */}
              <div className="flex items-center gap-4">
                {/* Previous track button */}
                <button
                  onClick={playPrevious}
                  className="p-3 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
                >
                  <FaStepBackward className="text-xl" />
                </button>
                {/* Play/Pause button */}
                <button
                  onClick={togglePlayPause}
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform"
                  style={{
                    background:
                      "linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)",
                  }}
                >
                  {isPlaying ? (
                    <FaPause className="text-xl" />
                  ) : (
                    <FaPlay className="text-xl ml-1" />
                  )}
                </button>
                {/* Next track button */}
                <button
                  onClick={playNext}
                  className="p-3 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
                >
                  <FaStepForward className="text-xl" />
                </button>
              </div>

              {/* Volume control (right side) - hidden on mobile */}
              <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
                {/* Time display */}
                <span className="text-sm text-slate-400 min-w-[80px] text-right">
                  {formatTime(audioRef.current?.currentTime)} /{" "}
                  {formatTime(audioRef.current?.duration)}
                </span>
                {/* Mute button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  {isMuted ? (
                    <FaVolumeMute className="text-slate-400" />
                  ) : (
                    <FaVolumeUp className="text-slate-400" />
                  )}
                </button>
                {/* Volume slider */}
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
                  className="w-24 accent-indigo-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
