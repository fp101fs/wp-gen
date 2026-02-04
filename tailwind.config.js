/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'purple': {
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          900: '#581C87'
        },
        'blue': {
          500: '#3B82F6',
          600: '#2563EB',
          900: '#1E3A8A'
        },
        'indigo': {
          500: '#6366F1',
          900: '#312E81'
        }
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    },
  },
  plugins: [],
}