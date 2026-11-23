import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://hi.a-dobe.club',
  output: 'static',
  // The CSP in public/_headers allows scripts from 'self' only, so small
  // scripts must ship as files rather than be inlined into the HTML.
  vite: { build: { assetsInlineLimit: 0 } },
});
