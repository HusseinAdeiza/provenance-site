import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this at /provenance-site/ — without base, asset URLs
  // are root-relative and every JS/CSS chunk 404s on the live page.
  base: process.env.SITE_BASE ?? '/provenance-site/',
  server: { host: '0.0.0.0', port: 5173 },
  preview: { host: '0.0.0.0', port: 4173 },
  build: { outDir: 'dist', sourcemap: false, target: 'es2022' },
})