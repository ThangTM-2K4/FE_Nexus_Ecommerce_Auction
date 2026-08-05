import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://bitdoubletk.duckdns.org',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
