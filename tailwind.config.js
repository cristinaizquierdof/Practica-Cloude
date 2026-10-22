/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0057FF', light: '#3D7FFF', pale: '#7AABFF', dark: '#003DB3' },
      },
    },
  },
  plugins: [],
}
