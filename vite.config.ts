import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    // Habilitar process.env para compatibilidad
    global: 'globalThis',
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      external: mode === 'development' ? [
        // Externalizar módulos de Node.js solo en desarrollo/Electron
        'google-auth-library',
        'googleapis'
      ] : [],
      output: {
        manualChunks: {
          'mui': ['@mui/material', '@mui/icons-material'],
          'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
          'date-fns': ['date-fns'],
          'react-router': ['react-router-dom'],
          'vendor': ['react', 'react-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: mode === 'development'
  },
  optimizeDeps: {
    exclude: mode === 'development' ? ['google-auth-library', 'googleapis'] : []
  },
  server: {
    port: 5175,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
}))
