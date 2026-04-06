import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion') || id.includes('gsap')) return 'vendor-motion';
            if (id.includes('lucide-react') || id.includes('react-quill-new') || id.includes('dompurify')) return 'vendor-ui';
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('ogl')) return 'vendor-viz';
            if (id.includes('html2canvas') || id.includes('html5-qrcode')) return 'vendor-utils';
            return 'vendor-base';
          }
        },
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
