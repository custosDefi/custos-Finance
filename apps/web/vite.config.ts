import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: '127.0.0.1',
    port: 3001,
    proxy: { '/api': 'http://127.0.0.1:8001' }
  },
  preview: {
    host: '127.0.0.1',
    port: 3001
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true
  }
})
