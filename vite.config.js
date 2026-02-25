import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: './',
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Marketing Site Pages
        index: path.resolve(__dirname, 'index.html'),
        'how-it-works': path.resolve(__dirname, 'how-it-works.html'),
        solutions: path.resolve(__dirname, 'solutions.html'),
        pricing: path.resolve(__dirname, 'pricing.html'),
        'request-quote': path.resolve(__dirname, 'request-quote.html'),
        resources: path.resolve(__dirname, 'resources.html'),
        security: path.resolve(__dirname, 'security.html'),
        about: path.resolve(__dirname, 'about.html'),

        'checkout-success': path.resolve(__dirname, 'checkout-success.html'),
      },
    },
  },
  server: {
    port: 5175,
    open: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@components': path.resolve(__dirname, './components'),
      '@styles': path.resolve(__dirname, './styles'),
    },
  },
});
