import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vitejs.dev/config/
export default defineConfig({
  base:'/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
  define: {
    'process.env.API_URL': JSON.stringify(process.env.VITE_API_URL),
  },
});