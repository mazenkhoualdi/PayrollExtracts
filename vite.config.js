import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    include: ['sql.js/dist/sql-wasm.js']
  },
  build: {
    outDir: 'dist'
  }
});
