import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

// Served from https://bossxor.github.io/works-dashboard/ (GitHub Pages).
const config = defineConfig({
  base: '/works-dashboard/',
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({ prerender: { enabled: true } }),
    viteReact(),
  ],
})

export default config
