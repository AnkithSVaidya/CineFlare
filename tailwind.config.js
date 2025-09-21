/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'xrp-blue': '#23292F',
        'xrp-gold': '#FFD700',
        'flare-orange': '#FF6B35',
      },
    },
  },
  plugins: [],
}
