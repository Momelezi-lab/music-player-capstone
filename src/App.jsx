import { useState } from "react";
import axios from "axios";

function App() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchMusic = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.deezer.com/v1/search?q=${query}`
      );
      setTracks(response.data.data.slice(0, 12));
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-10">My Music Player</h1>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchMusic()}
              placeholder="Search for songs or artists..."
              className="flex-1 px-6 py-4 rounded-full text-black text-lg"
            />
            <button
              onClick={searchMusic}
              className="bg-pink-600 hover:bg-pink-700 px-8 py-4 rounded-full font-bold"
            >
              Search
            </button>
          </div>
        </div>

        {loading && <p className="text-center text-xl">Loading...</p>}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="bg-white/10 backdrop-blur rounded-xl overflow-hidden hover:scale-105 transition transform"
            >
              <img
                src={track.album.cover_medium}
                alt={track.title}
                className="w-full h-48 object-cover
              />
              <div className="p-4">
                <h3 className="font-bold truncate">{track.title}</h3>
                <p className="text-sm opacity-80">{track.artist.name}</p>
                <audio controls className="w-full mt-3">
                  <source src={track.preview} type="audio/mpeg" />
                </audio>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;