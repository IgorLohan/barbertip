/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/preline/dist/*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf8f4',
          100: '#f5f0e8',
          200: '#ebe1d1',
          300: '#e1d2ba',
          400: '#d7c3a3',
          500: '#DDC28E', // Bege claro da logo (Tip)
          600: '#b89a6f',
          700: '#7A4B2D', // Marrom escuro da logo (Barber)
          800: '#5d3a22',
          900: '#402917',
        },
      },
    },
  },
  plugins: [],
}
