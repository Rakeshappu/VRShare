
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
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Forward auth headers properly
            const authHeader = req.headers.authorization;
            if (authHeader) {
              console.log('Forwarding Authorization header for:', req.url);
              proxyReq.setHeader('Authorization', authHeader);
            } else if (req.url?.includes('/admin/') || req.url?.includes('/auth/admin-check')) {
              console.warn('Missing Authorization header for admin route:', req.url);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
            
            // Debug unauthorized access
            if (proxyRes.statusCode === 401 || proxyRes.statusCode === 403) {
              console.warn(`Access denied (${proxyRes.statusCode}) for URL:`, req.url);
              // Log additional details for admin routes
              if (req.url?.includes('/admin/')) {
                console.warn('Admin access denied. Make sure the JWT token contains the correct role.');
                const authHeader = req.headers.authorization;
                if (authHeader) {
                  console.log('Authorization token exists but may be invalid for admin access');
                }
              }
            }
          });
        },
      },
      // Dedicated proxy for admin routes with higher priority
      '^/api/admin/.*': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Admin proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Ensure admin auth headers are forwarded
            const authHeader = req.headers.authorization;
            if (authHeader) {
              console.log('Forwarding Admin Authorization header for:', req.url);
              proxyReq.setHeader('Authorization', authHeader);
            } else {
              console.warn('Missing Authorization header for admin route:', req.url);
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
      // Specific proxy for auth debug-token route to prevent React Router issues
      '/api/auth/debug-token': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const authHeader = req.headers.authorization;
            if (authHeader) {
              console.log('Forwarding Authorization header for debug-token route');
              proxyReq.setHeader('Authorization', authHeader);
            }
          });
          proxy.on('proxyRes', (proxyRes, _req, _res) => {
            console.log('Debug token response status:', proxyRes.statusCode);
          });
        }
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
