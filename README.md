# NovaBeat - Futuristic Music Player 🎵

A beautiful, responsive music player built with **React + Vite**, **Tailwind CSS**, and the **Deezer API**.  
Search for any song or artist and play 30-second previews instantly — no login, no Spotify premium needed!

![NovaBeat Music Player](https://img.shields.io/badge/React-19.2.0-blue) ![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.17-38B2AC)

## ✨ Features

### Core Features
- **Search & Discover** - Search songs, artists, and albums in real-time using the Deezer API
- **Play Music** - Play 30-second song previews with native HTML5 audio controls
- **Favorites** - Save your favorite tracks for quick access
- **Custom Playlists** - Create and manage your own playlists
- **Recently Played** - Automatic tracking of your listening history
- **Trending Tracks** - Discover popular music on load

### User Experience
- **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- **Beautiful UI** - Glassmorphism design with gradient backgrounds
- **Smooth Animations** - Micro-interactions and transitions throughout
- **Error Handling** - User-friendly error messages and loading states
- **Local Storage** - All your data (playlists, favorites) persists locally

### Mobile Features
-  **Collapsible Sidebar** - Slide-out menu on mobile devices
-  **Bottom Player Bar** - Now Playing controls fixed at the bottom on mobile
-  **Touch Optimized** - Large touch targets and smooth scrolling

## Tech Stack

- **React 19** + **Vite** (blazing fast development)
- **Tailwind CSS 4** (modern utility-first styling)
- **Axios** (HTTP client for API requests)
- **React Icons** (beautiful icon library)
- **Deezer Public API** (free, no auth required): `https://api.deezer.com`

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd music-player-capstone-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 🏗️ Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory. You can preview the production build with:

```bash
npm run preview
```


Usage

Creating a Playlist
1. Click the **"Create Playlist"** button in the left sidebar
2. Enter a name for your playlist
3. Click **"Create"** or press Enter

Adding Songs to Playlists
1. Hover over any song in the track list
2. Click the **"+"** button next to the song
3. Select a playlist from the dropdown menu
4. The song will be added to your playlist!

Playing Music
1. Search for a song, artist, or album
2. Click on any track to start playing
3. Use the playback controls in the right sidebar (desktop) or bottom bar (mobile)
4. Control volume, skip tracks, and more!

Managing Playlists
- **View Playlist**: Click on any playlist in the sidebar to view its tracks
- **Delete Playlist**: Click the trash icon on any playlist card
- **Remove Songs**: When viewing a playlist, click the trash icon next to any song

Features Breakdown

Playlist Management
- Create unlimited custom playlists
- Add/remove songs from playlists
- Delete playlists
- View playlist tracks
- All data saved to local storage

### Search & Discovery
- Real-time search with Deezer API
- Search by song, artist, or album
- Trending tracks on app load
- Error handling for failed requests
- Loading states with spinner

### Playback Controls
- Play/Pause
- Next/Previous track
- Progress bar (clickable to seek)
- Volume control with mute
- Time display (current/remaining)

### Responsive Design
- Desktop (3-column layout)
- Tablet (collapsible sidebar, bottom player)
- Mobile (stacked layout, slide-out menu)
- Touch-friendly controls

## Project Structure

```
music-player-capstone-main/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Component-specific styles
│   ├── index.css        # Global styles and animations
│   └── main.jsx         # Application entry point
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

📝 License

This project is open source and available under the MIT License.

Author

**Apiwe Fuziile**

Built as a capstone project showcasing modern React development practices, responsive design, and API integration.


