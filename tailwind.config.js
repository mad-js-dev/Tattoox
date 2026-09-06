/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  darkMode: 'class',
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#1e1e1e',
      },
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.glass-primary': {
          'backdrop-filter': 'blur(12px) saturate(180%)',
          'background-color': 'rgba(255, 255, 255, 0.3)',
        },
        '.dark .glass-primary': {
          'background-color': 'rgba(30, 30, 30, 0.3)',
        },
        '.glass-utility': {
          'backdrop-filter': 'blur(8px)',
          'background-color': 'rgba(255, 255, 255, 0.5)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.dark .glass-utility': {
          'background-color': 'rgba(30, 30, 30, 0.5)',
          'border-color': 'rgba(255, 255, 255, 0.1)',
        },
      })
    }),
  ],
}
