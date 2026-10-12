import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages usa /francisco-brisa/; Render con dominio propio usa VITE_BASE=/
  base: command === 'build' ? process.env.VITE_BASE || '/francisco-brisa/' : '/',
}))
