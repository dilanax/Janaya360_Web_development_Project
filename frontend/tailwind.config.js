module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // your existing colors
        'sriLanka-orange': '#FF6B35',
        'sriLanka-maroon': '#800000',

        // ✅ ADD THESE NEW COLORS
        parliament: {
          600: "#EA580C",
          700: "#C2410C",
        },
      },
    },
  },
  plugins: [],
}