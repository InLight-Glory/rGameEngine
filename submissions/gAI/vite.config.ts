import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'app',
    sourcemap: false,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'dev.html'),
      },
    },
  },
});