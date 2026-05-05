/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon': '#00ff41',
        'neon-dim': '#00cc33',
        'dark-green': '#003b00',
        'panel': '#0d0d0d',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 8px #00ff41, 0 0 20px #00ff4133',
        'neon-sm': '0 0 4px #00ff41, 0 0 10px #00ff4122',
      },
    },
  },
  plugins: [],
};
