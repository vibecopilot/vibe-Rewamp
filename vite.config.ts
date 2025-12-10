import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 2000,
    // Optimize build
    target: 'esnext',
    minify: 'esbuild',
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'charts': ['apexcharts', 'react-apexcharts', 'chart.js', 'react-chartjs-2'],
          'utils': ['axios', 'date-fns', 'moment', 'lodash'],
        },
      },
    },
    // Reduce sourcemap size in production
    sourcemap: mode === 'development',
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@mhoc/axios-digest-auth'],
  },
  // Increase memory for esbuild
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
}));
