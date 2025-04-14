
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Forward auth headers properly
            const authHeader = req.headers.authorization;
            if (authHeader) {
              proxyReq.setHeader('Authorization', authHeader);
            }
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/api/admin': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        priority: 100, // Higher priority than the general /api route
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Admin proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Ensure admin auth headers are forwarded
            const authHeader = req.headers.authorization;
            if (authHeader) {
              proxyReq.setHeader('Authorization', authHeader);
              console.log('Admin request with auth header:', req.method, req.url);
            } else {
              console.warn('Admin request missing auth header:', req.method, req.url);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Admin Response:', proxyRes.statusCode, req.url);
            
            // Debug response headers
            const headers = proxyRes.headers;
            if (proxyRes.statusCode >= 400) {
              console.log('Admin error response headers:', headers);
            }
          });
        },
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'ws://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
