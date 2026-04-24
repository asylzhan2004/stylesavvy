import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Chunk splitting removed to let Vite handle React dependencies correctly and avoid 'useLayoutEffect' error
    rollupOptions: {
      // Vite по умолчанию сам отлично справляется с чанками
    },
    // Предупреждения о больших чанках убраны (GLB файлы большие — это нормально)
    chunkSizeWarningLimit: 1000,
    // Минификация
    minify: 'esbuild',
    target: 'esnext',
  },

  // Оптимизация зависимостей при старте dev-сервера
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'framer-motion'],
  },

  server: {
    // Gzip сжатие в dev режиме
    hmr: {
      overlay: false, // убираем overlay ошибок (меньше DOM нагрузка)
    },
  },
})
