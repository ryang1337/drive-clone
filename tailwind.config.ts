import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans_condensed: ['var(--font-plex-condensed)', 'sans-serif'],
        sans: ['var(--font-plex)', 'sans-serif'],
      }
    },
  },
  plugins: [],
  darkMode: "class",
}
export default config
