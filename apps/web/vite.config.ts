import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const caseInsensitiveCardsPlugin = () => ({
  name: 'case-insensitive-cards',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url && req.url.startsWith('/cards/')) {
        const decodedUrl = decodeURIComponent(req.url.split('?')[0]);
        const reqFileName = path.basename(decodedUrl).toLowerCase();
        const cardsDir = path.resolve(__dirname, 'public/cards');
        try {
          if (fs.existsSync(cardsDir)) {
            const files = fs.readdirSync(cardsDir);
            const matched = files.find((f: string) => f.toLowerCase() === reqFileName);
            if (matched) {
              const filePath = path.join(cardsDir, matched);
              const ext = path.extname(matched).toLowerCase();
              const mime =
                ext === '.png'
                  ? 'image/png'
                  : ext === '.jpg' || ext === '.jpeg'
                  ? 'image/jpeg'
                  : 'application/octet-stream';
              res.setHeader('Content-Type', mime);
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          }
        } catch {
          // Fall through
        }
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), caseInsensitiveCardsPlugin()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true
      }
    }
  }
});
