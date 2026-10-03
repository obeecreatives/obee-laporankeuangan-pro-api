import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          id: '/',
          name: 'Laporan Keuangan obeecreatives',
          short_name: 'ObeeFinance',
          description: 'Unified Workspace OS & Sistem Laporan Keuangan Modern obeecreatives',
          theme_color: '#E30000',
          background_color: '#0B0F17',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/icon.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        devOptions: {
          enabled: false, // Disabled in dev mode to prevent iframe service worker registration errors
        },
      }),
      {
        name: 'gas-proxy-api',
        configureServer(server) {
          server.middlewares.use('/api/gas-proxy', async (req, res) => {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const { endpointUrl, action, params, postBody } = parsed;

                if (!endpointUrl) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ success: false, message: 'URL endpoint wajib diisi.' }));
                }

                const targetUrl = new URL(endpointUrl);
                if (action) targetUrl.searchParams.set('action', action);
                targetUrl.searchParams.set('t', String(Date.now()));
                if (params && typeof params === 'object') {
                  Object.keys(params).forEach((key) => {
                    targetUrl.searchParams.set(key, String(params[key]));
                  });
                }

                const isPost = !!postBody;
                const response = await fetch(targetUrl.toString(), {
                  method: isPost ? 'POST' : 'GET',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Obeecreatives-Workspace-OS/2.4',
                  },
                  body: isPost ? JSON.stringify(postBody) : undefined,
                  redirect: 'follow',
                });

                const text = await response.text();
                res.setHeader('Content-Type', 'application/json');

                try {
                  const json = JSON.parse(text);
                  res.end(JSON.stringify({ success: true, isJson: true, data: json }));
                } catch {
                  const isAccessDenied = text.includes('Akses Ditolak');
                  res.end(
                    JSON.stringify({
                      success: false,
                      isJson: false,
                      isAccessDenied,
                      message: isAccessDenied
                        ? 'Endpoint Apps Script merespons "Akses Ditolak".'
                        : 'Respons bukan format JSON yang valid.',
                    })
                  );
                }
              } catch (err: unknown) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    message: err instanceof Error ? err.message : String(err),
                  })
                );
              }
            });
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
