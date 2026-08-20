# aidecisioncontrol.org

Website for the **AI Decision Control Forum** — an independent practitioner community
examining how organisations retain operational control when AI participates in
consequential decisions and actions.

Built with [Astro](https://astro.build) (static output) and TypeScript. No framework
runtime, database or authentication — every page is prerendered HTML.

## Local development

```sh
npm install
npm run dev
```

The dev server runs at `http://localhost:4321`.

## Production build

```sh
npm run build
```

This runs `astro check` (type checking) followed by `astro build`, and outputs static
files to `./dist/`. Preview the production build locally with:

```sh
npm run preview
```

## Project structure

```
src/
├── consts.ts                # Site-wide facts: name, domain, email, LinkedIn placeholder
├── content.config.ts        # Content collection schema for Perspectives articles
├── content/perspectives/    # Drop .md/.mdx files here to publish an article
├── data/                    # Data-driven content for cards, nav, sectors, etc.
├── components/              # Reusable Astro components
├── layouts/BaseLayout.astro # SEO meta, structured data, header/footer shell
└── pages/                   # File-based routes
```

To add a Perspectives article, create a Markdown/MDX file in
`src/content/perspectives/` with `title`, `description` and `publishDate`
frontmatter — it will appear automatically on `/perspectives` and get its own
`/perspectives/[slug]` page.

## Cloudflare deployment

This repository deploys to **Cloudflare Pages** via the GitHub integration (push to
`main` triggers a build and deploy). It is a static site with no Workers Functions, so
no server-side runtime configuration is required.

Cloudflare Pages dashboard build settings:

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node version | 20+ (project requires `>=20.3.0`) |

A `wrangler.toml` is included for CLI parity (`wrangler pages deploy dist`) but is not
required for the dashboard's Git-connected deployments.

## Custom domain

Production is served at **aidecisioncontrol.org**, configured as a custom domain on the
Cloudflare Pages project. DNS is managed separately in Google Workspace / the domain
registrar — this repository does not manage DNS records.

## Content policy

- No confirmed Founding Experts, events, dates or partnerships are invented. Data
  structures in `src/data/` are ready for real content to be added as it is confirmed.
- All contact links use `hello@aidecisioncontrol.org`.
- The Forum's LinkedIn URL is a placeholder (`SITE.linkedInUrl` in `src/consts.ts`) —
  set it once the page exists; footer/structured-data links only render when it's non-empty.
