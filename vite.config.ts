import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input : {
        index: resolve(__dirname, 'index.html'),
        popup: resolve(__dirname, 'popup.html'),
      }
    }
  }
})
