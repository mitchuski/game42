import { defineConfig } from 'vite';

// base: './' so the built dist/ works opened directly or served from any path.
export default defineConfig({
  base: './',
  server: { port: 4200, strictPort: true, open: false },
  preview: { port: 4200, strictPort: true },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: { input: { map: 'index.html', territory: 'territory.html', constellation: 'constellation.html', grid: 'grid.html' } },
  },
});
