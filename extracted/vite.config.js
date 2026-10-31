import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Build 100 % autonome pour Cloudflare Pages :
// aucun plugin ni backend externe — tout est servi depuis le domaine Cloudflare.
export default defineConfig({
  logLevel: 'error',
  resolve: {
    alias: {
      '@': '/src/',
    },
  },
  plugins: [react()],
});
