// @ts-check
import { defineConfig } from 'astro/config'
import serviceWorker from '@ayco/astro-sw'
import sitemap from '@astrojs/sitemap'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import * as data from './package.json'

import icon from 'astro-icon'

// https://astro.build/config
export default defineConfig({
  site: 'https://ayo.ayco.io',
  image: {
    domains: ['cdn.bsky.app', 'media.ayco.io'],
    remotePatterns: [{ protocol: 'https' }],
  },
  integrations: [
    sitemap(),
    serviceWorker({
      path: './src/sw.mjs',
      assetCachePrefix: 'ayco-personal-site',
      assetCacheVersionID: data.version,
      logAssets: true,
      include: [
        '/wc/node_modules/web-component-base/dist/index.js',
        '/wc/node_modules/@ayo-run/status-indicator/dist/status-indicator.js',
      ],
      esbuild: {
        minify: true,
      },
      registrationHooks: {
        afterRegistration: () => {
          console.log('>>> registered sw')
        },
      },
    }),
    icon({
      include: {
        mdi: ['*'],
        tabler: ['*'],
        'simple-icons': ['*'],
      },
    }),
  ],
  vite: {
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: './node_modules/web-component-base/dist/index.js',
            dest: 'wc',
          },
          {
            src: './node_modules/@ayo-run/status-indicator/dist/status-indicator.js',
            dest: 'wc',
          },
        ],
      }),
    ],
  },
})
