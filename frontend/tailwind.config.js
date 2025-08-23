/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
    colors: {
      'gulabrown': '#3B3429',
      'ggwhite': '#D9D9D9',
      'ggrey': '#6A6A6A',
      'white': '#FFFFFF',
      'black': '#000000',
      'manta': '#1C2129',
    },
    fontFamily:{
      body:['DM Sans', 'sans-serif'],
      heading:['Alexandria', 'sans-serif'],
      lato:['Lato', 'sans-serif'],
      teachers:['Teachers', 'sans-serif'],
    }
  },
  plugins: [],
}

