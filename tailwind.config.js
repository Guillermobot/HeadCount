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
          bg:      '#121212',   // Power BI canvas background
          card:    '#1E1E1E',   // Power BI visual background
          sidebar: '#141414',   // Sidebar / nav background
          border:  '#333333',   // Power BI grid lines / dividers
          accent:  '#118DFF',   // Microsoft blue (primary action)
          success: '#00B01D',   // Power BI green (data color)
          warning: '#E66C37',   // Power BI orange (reference / objective)
          danger:  '#D64550',   // Power BI red (critical)
          'dark-blue': '#12239E', // Power BI dark blue
          text: {
            primary:   '#FFFFFF',  // Primary white
            secondary: '#A6A6A6',  // Axis labels / secondary text
            muted:     '#666666',  // Placeholder / disabled text
          }
        }
      },
      fontFamily: {
        // Exact Power BI font stack
        segoe: ['"Segoe UI"', '"wf_standard-font"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        // Power BI uses minimal border radius
        'pbi': '2px',
        DEFAULT: '2px',
        'sm': '2px',
        'md': '4px',
        'lg': '4px',
        'xl': '4px',
        '2xl': '4px',
        'full': '9999px',
      },
      fontSize: {
        'pbi-label': ['10px', { lineHeight: '14px', letterSpacing: '0.04em' }],
        'pbi-value': ['22px', { lineHeight: '28px', fontWeight: '600' }],
      }
    },
  },
  plugins: [],
}
