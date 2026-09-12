// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://aidecisioncontrol.org',
  // Server output is required for the membership API routes (Stripe checkout
  // + webhook) and the membership success page, which must run per-request.
  // Every other page opts back into build-time prerendering individually via
  // `export const prerender = true`, so the rest of the site is unaffected.
  output: 'server',
  adapter: cloudflare(),
  integrations: [sitemap(), react()],
  trailingSlash: 'never',
});
