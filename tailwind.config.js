/**
 * Tailwind CSS Configuration
 * Created by: Apiwe Fuziile
 * 
 * This file configures Tailwind CSS for my music player app.
 * I've extended the default theme with custom fonts and colors.
 */

module.exports = {
  // Tell Tailwind which files to scan for class names
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Custom font family - Outfit for a modern look
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      // Custom animation for sound wave effect
      animation: {
        'bounce-slow': 'bounce 1.5s infinite',
      },
    },
  },
  plugins: [],
}
