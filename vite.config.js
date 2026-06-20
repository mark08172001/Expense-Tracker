import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        transactions: resolve(__dirname, 'transactions.html'),
        categories: resolve(__dirname, 'categories.html'),
        budgets: resolve(__dirname, 'budgets.html'),
        reports: resolve(__dirname, 'reports.html'),
        profile: resolve(__dirname, 'profile.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
