import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Empty today — the Perspectives page shows conceptual "coming soon" cards
// (see src/data/perspectivesConcepts.ts) instead. Drop a .md/.mdx file into
// src/content/perspectives/ to publish a real article; it will appear
// automatically on /perspectives and get its own /perspectives/[slug] page.
const perspectives = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/perspectives' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    author: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { perspectives };
