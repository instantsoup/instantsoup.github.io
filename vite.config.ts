import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For a user-site (USERNAME.github.io) the base is '/'.
export default defineConfig({
  plugins: [react()],
  base: '/'
})
