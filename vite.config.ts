import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// For a user-site (USERNAME.github.io) the base is '/'.
export default defineConfig({
  plugins: [react()],
  base: '/',
});
