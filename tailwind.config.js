/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        rubik: ['var(--font-rubik)', 'sans-serif'],
      },
      colors: {
        darkbg: '#05192C',
        cardbg: '#0a1a2f',
        borderLight: '#1e3a5f',
        accent: '#3b7a9e',
      },
    },
  },
  plugins: [],
}