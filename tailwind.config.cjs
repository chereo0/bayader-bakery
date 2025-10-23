module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bakery: {
          900: '#5A3E2B',
          800: '#7A573E',
          700: '#8B5E3C',
          500: '#C8A27A',
          200: '#F5E9DA',
          100: '#FBF7F2',
        }
      },
      fontFamily: {
        display: ['"Roboto Condensed"', 'sans-serif'],
        body: ['Mulish', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(90,62,43,0.08)'
      }
    }
  },
  plugins: [],
}
