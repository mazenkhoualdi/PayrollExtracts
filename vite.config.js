import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// sql.js ships a .wasm binary that Vite must treat as a static asset (not bundle as JS).
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    exclude: ['sql.js']
  }
});
