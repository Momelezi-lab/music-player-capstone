
import { useState } from "react";
import axios from "axios";

function App() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchMusic = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.deezer.com/search?q=${encodeURIComponent(query)}`
      );
      setTracks(response.data.data.slice(0, 12));
    } catch (error) {
      console.error("Error fetching music:", error);
      alert("Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-12 tracking-tight">
          My Music Player
        </h1>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchMusic()}
              placeholder="Search songs, artists, albums..."
              className="flex-1 px-6 py-4 rounded-full text-black text-lg outline-none shadow-lg"
            />
            <button
              onClick={searchMusic}
              className="bg-pink-600 hover:bg-pink-700 px-10 py-4 rounded-full font-bold text-lg shadow-lg transition transform hover:scale-105"
            >
              Search
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-center text-2xl animate-pulse">Loading songs...</p>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-7xl mx-auto">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-xl"
            >
              <img
                src={track.album.cover_medium}
                alt={track.title}
                className="w-full aspect-square object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-sm truncate">{track.title}</h3>
                <p className="text-xs opacity-80 truncate">{track.artist.name}</p>

                {/* 30-second preview */}
                <audio
                  controls
                  className="w-full mt-3 h-9"
                  preload="none"
                >
                  <source src={track.preview} type="audio/mpeg" />
                  Your browser does not support audio.
                </audio>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!loading && tracks.length === 0 && query && (
          <p className="text-center text-xl mt-20 opacity-70">
            No results found for "{query}". Try something else!
          </p>
        )}
      </div>
    </div>
  );
}

export default App;