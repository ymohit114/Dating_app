/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // User Dating App Signature Theme
        plum: {
          50: '#fdf3f5',
          100: '#fce7eb',
          200: '#f9d2d9',
          300: '#f4adc0',
          400: '#eb7b9b',
          500: '#dc4e76',
          600: '#b83256',
          700: '#8B2942', // Signature Deep Plum
          800: '#752438',
          900: '#642232',
          950: '#3D1B26',
        },
        ivory: {
          50: '#FFFFFF',
          100: '#FAF6F1', // Signature Soft Ivory Background
          200: '#F3ECE4',
          300: '#E8DDD2', // Clay accent
          400: '#D5C3B3',
        },
        clay: {
          DEFAULT: '#E8DDD2',
          dark: '#C8B8A9',
        },
        gold: {
          DEFAULT: '#C9A24B', // Signature Muted Gold
          light: '#E2BF6F',
          dark: '#A88334',
        },
        surface: {
          light: '#FFFFFF',
          card: '#FAF6F1',
          clay: '#E8DDD2',
          dark: '#1F1A1C',
          darkCard: '#2B121A',
        },
        charcoal: {
          900: '#1F1A1C',
          800: '#332B2E',
          700: '#4A3E42',
          600: '#7A6B70',
          500: '#9E8F94',
        },
        // Admin SaaS Design System Theme
        admin: {
          bg: '#0B1020',
          card: '#111827',
          cardHover: '#162032',
          border: '#1F2937',
          primary: '#7C3AED',
          primaryHover: '#6D28D9',
          secondary: '#2563EB',
          secondaryHover: '#1D4ED8',
          text: '#F9FAFB',
          muted: '#9CA3AF',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
