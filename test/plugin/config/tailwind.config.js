import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  // Intentionally empty to ensure the plugin overrides it.
  content: [],
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.from-plugin': {
          position: 'fixed',
          top: '0px',
        },
      });
    }),
  ],
};
