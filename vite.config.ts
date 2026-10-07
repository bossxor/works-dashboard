import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

// Set by the GitHub Pages workflow; builds a static, prerendered site under this sub-path.
const pagesBase = process.env.PAGES_BASE

const config = defineConfig({
  base: pagesBase ?? '/',
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    !pagesBase && netlify(),
    tanstackStart(pagesBase ? { prerender: { enabled: true } } : undefined),
    viteReact(),
  ],
})

export default config
