import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    mkcert(),
  ],
})
