// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // Change this value based on the theme
        secondary: '#1e3a8a', // Change this value based on the theme
        background: '#f3f4f6', // Change this value based on the theme
        darker: '#dadbdd', // Change this value based on the theme
        darkest: '#aaaaac', // Change this value based on the theme
        outline: '#88888a', // Change this value based on the theme
        accent: '#2dd4bf', // Change this value based on the theme
      },
    },
  },
  plugins: [],
}