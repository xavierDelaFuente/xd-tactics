import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Dev-only: routes /explorer to the Fastify API so the browser never sees a
      // cross-origin request. Production routing (reverse proxy / gateway) is a later phase.
      '/explorer': 'http://localhost:3001',
    },
  },
});
