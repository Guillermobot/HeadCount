/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#111111',
          card: '#1D1D1D',
          sidebar: '#161616',
          border: '#2D2D2D',
          accent: '#118DFF',
          success: '#107C41',
          warning: '#F1C40F',
          danger: '#A80000',
          text: {
            primary: '#F3F2F1',
            secondary: '#A19F9D',
            muted: '#605E5C',
          }
        }
      },
      fontFamily: {
        segoe: ['"Segoe UI"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

