import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    host: true,
    // Docker Desktop on Windows doesn't propagate filesystem change events into
    // bind-mounted containers, so the default watcher never fires there — poll instead.
    watch: process.env.DOCKER ? { usePolling: true, interval: 300 } : undefined,
  },
})
