/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary: deep blue
        primary: {
          50: '#eef4ff',
          100: '#dae6ff',
          200: '#bdd3ff',
          300: '#90b6fe',
          400: '#5c8efb',
          500: '#3767f5',
          600: '#2149ea',
          700: '#1a37d0',
          800: '#1b30a8',
          900: '#1c2f84',
          950: '#151f51',
        },
        // Accent: teal (Tailwind's teal scale)
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Vazirmatn', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        fa: ['Vazirmatn', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
      },
    },
  },
  plugins: [],
};
