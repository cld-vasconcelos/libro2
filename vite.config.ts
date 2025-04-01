import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { Buffer } from 'buffer';
import process from 'process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    'process.env': process.env,
    'global': {},
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['@supabase/supabase-js'],
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      crypto: 'crypto-js',
      stream: 'stream-browserify',
      buffer: 'buffer',
    },
  },
}));
