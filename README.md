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

This repository is connected to Cloudflare as a **Workers Build** (not the classic
Cloudflare Pages product) — pushing to `main` triggers Cloudflare to run the project's
configured build command, then its deploy command:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |
| Node version | 20+ (project requires `>=20.3.0`) |

Because the deploy step is `wrangler deploy` rather than `wrangler pages deploy`, the
site is served as a Worker with **static assets** — there is no Worker script (`main`)
since this site has no server-side logic. `wrangler.toml` declares the asset directory:

```toml
[assets]
directory = "./dist"
```

`wrangler` is pinned as a devDependency so Cloudflare's build doesn't fetch a fresh copy
on every deploy. To deploy manually from the CLI: `npm run build && npx wrangler deploy`.

## Custom domain

Production is served at **aidecisioncontrol.org**. The domain's nameservers are already
on Cloudflare, but the domain must be attached to this Worker in the Cloudflare
dashboard (Workers & Pages → this project → Settings → Domains & Routes) before the
site is reachable there — pushing code alone does not attach a domain. DNS records
themselves are managed separately (Google Workspace / registrar) — this repository does
not manage DNS.

## Content policy

- No confirmed Founding Experts, events, dates or partnerships are invented. Data
  structures in `src/data/` are ready for real content to be added as it is confirmed.
- All contact links use `hello@aidecisioncontrol.org`.
- The Forum's LinkedIn URL is a placeholder (`SITE.linkedInUrl` in `src/consts.ts`) —
  set it once the page exists; footer/structured-data links only render when it's non-empty.
