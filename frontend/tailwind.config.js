/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:  '#008080',
        secondary:'#00a0a0',
        accent:   '#F4A261',
        light:    '#D8F3DC',
        dark:     '#1B4332',
        muted:    '#6B7280',
        cream:    '#FAFAF7',
        teal:     '#D1EEEA',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans:  ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
