import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        active: {
          50: '#B4F7CF',
        },
        blocked: {
          50: '#F7B4B4',
        },
        pending: {
          50: '#E4DB71',
        },
        open: {
          50: '#f2d88b',
        },
        sent: {
          50: '#b4d3f1',
        },
        delayed: {
          50: '#757575',
        },
        due: {
          50: '#f7b4b4',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
