import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative base './' ensures compatibility in local dev as well as GitHub Pages subpaths (/<repo>/)
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('xlsx')) return 'xlsx';
          if (id.includes('firebase')) return 'firebase';
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
