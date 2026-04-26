import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three': ['three'],
          'vendor-r3f': ['@react-three/fiber', '@react-three/drei'],
          'vendor-framer': ['framer-motion'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    target: 'esnext',
    cssMinify: true,
    sourcemap: false,
  },

  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'framer-motion', 'react', 'react-dom'],
  },

  server: {
    hmr: {
      overlay: false,
    },
  },
})
