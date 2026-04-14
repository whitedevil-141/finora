import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // For GitHub Pages, use /finora/ as base path
  // Environment variable can override this if needed
  base: process.env.VITE_BASE_URL || (process.env.NODE_ENV === 'production' ? '/finora/' : '/'),
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
