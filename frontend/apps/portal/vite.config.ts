import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// N-PQMS ISM portal — desktop-first enterprise SPA.
//
// The design-system token CSS is imported globally in src/main.tsx as
// '@pqms/design-tokens/styles.css'; every `var(--*)` resolves app-wide. No CSS
// preprocessing needed (tokens are plain CSS).
//
// WORKSPACE RESOLUTION: no aliases for the @pqms/* packages. pnpm symlinks each
// workspace package into node_modules, and their package.json "exports" maps both
// the root entry and subpaths such as "@pqms/design-tokens/styles.css".
//
// An earlier attempt aliased the package NAMES to their index.ts FILES. That breaks
// subpath imports: "@pqms/design-tokens/styles.css" resolved to
// ".../src/index.ts/styles.css" and the build failed with ENOENT. An alias to a file
// cannot have children. Left as a comment because the failure is non-obvious and the
// fix looks like a regression to anyone who thinks aliases are required here.
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
