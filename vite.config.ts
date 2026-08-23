import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function pwaVersionPlugin(): Plugin {
  return {
    name: 'vite-plugin-pwa-version',
    // In production build: replace __SW_BUILD_ID__ in dist/sw.js with a unique timestamp
    closeBundle() {
      const buildId = 'v2.' + Date.now();
      const distSw = path.resolve(__dirname, 'dist/sw.js');
      if (fs.existsSync(distSw)) {
        let content = fs.readFileSync(distSw, 'utf-8');
        content = content.replace(/__SW_BUILD_ID__/g, buildId);
        fs.writeFileSync(distSw, content, 'utf-8');
        console.log(`\n📦 [PWA] Service Worker compilado com versão única: ${buildId}\n`);
      }
    },
    // In development mode: serve sw.js with a stable dev version & no-cache headers
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/sw.js') {
          const publicSw = path.resolve(__dirname, 'public/sw.js');
          if (fs.existsSync(publicSw)) {
            let content = fs.readFileSync(publicSw, 'utf-8');
            content = content.replace(/__SW_BUILD_ID__/g, 'dev-local');
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            return res.end(content);
          }
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), pwaVersionPlugin()],
  define: {
    __APP_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  server: {
    port: 5173,
    host: true,
  },
});
