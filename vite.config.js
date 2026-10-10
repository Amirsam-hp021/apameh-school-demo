import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // Production builds are served from GitHub Pages at /apameh-school-demo/.
  base: command === 'build' ? '/apameh-school-demo/' : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split large libraries into their own cached chunks.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          i18n: ['i18next', 'react-i18next'],
          charts: ['recharts'],
          calendar: ['react-big-calendar', 'date-fns'],
        },
      },
    },
  },
}));
