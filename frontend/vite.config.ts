import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// N-PQMS ISM frontend — desktop-first enterprise SPA.
// The design-system token CSS is imported globally in src/main.tsx; every
// `var(--*)` resolves app-wide. No CSS preprocessing needed (tokens are plain CSS).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
})
