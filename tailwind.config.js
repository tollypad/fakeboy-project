/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        crt: {
          50: '#e6ffef',
          100: '#c9ffe0',
          200: '#97f3c1',
          300: '#64e1a2',
          400: '#36c680',
          500: '#1aa864',
          600: '#0f7f4b',
          700: '#0c5e3a',
          800: '#0a432b',
          900: '#082d1f'
        },
        panel: {
          900: '#07140e',
          800: '#0c1b14',
          700: '#0f231a'
        }
      },
      boxShadow: {
        glow: '0 0 25px rgba(54, 198, 128, 0.35)',
        innerGlow: 'inset 0 0 30px rgba(26, 168, 100, 0.25)'
      }
    }
  },
  plugins: []
}
