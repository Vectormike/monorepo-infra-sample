/// <reference types="vitest" />
import { defineConfig, searchForWorkspaceRoot } from 'vite';

import react from '@vitejs/plugin-react';
import relay from 'vite-plugin-relay';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

import viteTsConfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/website',

  server: {
    port: 4000,
    host: 'localhost',
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd())
      ]
    }
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    viteCommonjs(),
    react({
      babel: {
        plugins: [['relay', {
          eagerESModules: true,
          artifactDirectory: path.resolve(__dirname, './src/__generated__'),
          language: 'typescript'
        }]],
      },
    }),
    relay,
    viteTsConfigPaths({
      root: '../../',
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },

  resolve: {
    alias: {
      Assets: path.resolve(__dirname, './src/assets'),
      Components: path.resolve(__dirname, './src/components'),
      Elements: path.resolve(__dirname, './src/elements'),
      Features: path.resolve(__dirname, './src/features'),
      Hooks: path.resolve(__dirname, './src/hooks'),
      Libs: path.resolve(__dirname, './src/libs'),
      Pages: path.resolve(__dirname, './src/pages'),
      Routes: path.resolve(__dirname, './src/routes'),
      Services: path.resolve(__dirname, './src/services'),
      State: path.resolve(__dirname, './src/state'),
      Stories: path.resolve(__dirname, './src/stories'),
      Tests: path.resolve(__dirname, './src/tests'),
      Types: path.resolve(__dirname, './src/types'),
      Utils: path.resolve(__dirname, './src/utils'),
      Generated: path.resolve(__dirname, './src/__generated__'),
    }
  }
});
