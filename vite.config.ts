import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
            return 'pdf';
          }
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/@tanstack') ||
            id.includes('node_modules/lucide-react')
          ) {
            return 'vendor';
          }
        },
      },
    },
  },
})
