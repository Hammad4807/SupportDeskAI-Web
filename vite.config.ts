import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fixed port: the API's CORS policy only allows http://localhost:5173.
  server: { port: 5173, strictPort: true },
})
