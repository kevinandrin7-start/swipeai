import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  // Escape non-ASCII in output so bundles are safe for any static host.
  esbuild: { charset: 'ascii' },
});
