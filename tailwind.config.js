export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 500: '#2878bd', 600: '#1e66a1', 700: '#194f80', 800: '#163f65', 900: '#112f49' },
        sidebar: '#17212b'
      },
      boxShadow: { card: '0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.04)', float: '0 12px 30px rgba(15,23,42,.14)' }
    }
  },
  plugins: []
}
