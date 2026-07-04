import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
        border: 'hsl(214 32% 91%)',
        input: 'hsl(214 32% 91%)',
        ring: 'hsl(215 20% 65%)',
        background: '#ffffff',
        foreground: 'hsl(222 47% 11%)',
        secondary: 'hsl(210 40% 96%)',
        'secondary-foreground': 'hsl(222 47% 11%)',
        destructive: 'hsl(0 84% 60%)',
        'destructive-foreground': 'hsl(210 40% 98%)',
        muted: 'hsl(210 40% 96%)',
        'muted-foreground': 'hsl(215 16% 47%)',
        accent: 'hsl(210 40% 96%)',
        'accent-foreground': 'hsl(222 47% 11%)',
      },
    },
  },
  plugins: [animate],
}
