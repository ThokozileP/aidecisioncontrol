# aidecisioncontrol.org

Website for the **AI Decision Control Forum** — an independent practitioner community
examining how organisations retain operational control when AI participates in
consequential decisions and actions.

Built with [Astro](https://astro.build) and TypeScript. Most pages are still prerendered
static HTML, but the site now runs in Astro's server output mode (via the
`@astrojs/cloudflare` adapter) so the `/membership` application flow can use real API
routes, Stripe Checkout, and Workers KV — see "Membership application" below.

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
site is served as a Worker. Most pages are still prerendered static HTML, but the
membership flow (`/membership`, `/admin/*`, `/api/membership/*`) needs real server-side
routes, so the site runs in Astro's server output mode via the `@astrojs/cloudflare`
adapter, which builds a worker + static-asset split (`dist/server`, `dist/client`).
`wrangler.toml` sets `main = "@astrojs/cloudflare/entrypoints/server"` — the adapter's
own stable package entrypoint, not a path under `dist/` — specifically so `wrangler
deploy` can resolve it on a clean checkout *before* the Build step has produced anything;
see the comment in `wrangler.toml` for the exact failure this avoids (an earlier version
pointed `main` at a `dist/server/...` path, which broke the very first production deploy
of the membership feature with "Cannot use assets with a binding in an assets-only
Worker"). Both the Build and Deploy commands above must stay configured as separate
steps — `dist/` needs to already exist by the time the Deploy step's `wrangler deploy`
process starts.

`wrangler` is pinned as a devDependency so Cloudflare's build doesn't fetch a fresh copy
on every deploy. To deploy manually from the CLI: `npm run build && npx wrangler deploy`.

## Membership administration

`/membership` is a paid Professional Membership application — €7.99/month, billed
annually as a single €95.88 payment (not a recurring subscription), covering 12 months
from activation — built with Stripe Checkout. `/admin/memberships` is the internal
dashboard for Forum administrators to view, search and export that data.

### Setup checklist

1. **Cloudflare KV** — applications and memberships are stored in one KV namespace.
   Create it with `npx wrangler kv namespace create MEMBERSHIPS` and paste the returned
   id into `wrangler.toml`'s `[[kv_namespaces]]` block (it ships with a placeholder id
   that must be replaced before deploying — `astro dev`/`wrangler dev` simulate the
   namespace locally with no setup needed). There is no other database in this project;
   this is the only place membership data lives.
2. **Stripe** — set `STRIPE_SECRET_KEY` as a Worker secret in production
   (`npx wrangler secret put STRIPE_SECRET_KEY`) and in a local `.dev.vars` file for
   development (copy `.dev.vars.example`). Then register a webhook endpoint in the
   Stripe dashboard at `<site>/api/membership/webhook` subscribed to three events —
   `checkout.session.completed`, `checkout.session.expired`, and
   `checkout.session.async_payment_failed` — and set its signing secret as
   `STRIPE_WEBHOOK_SECRET`. The checkout amount (€95.88 EUR, one annual payment — displayed
   in the UI as €7.99/month billed annually, never configured as a recurring subscription)
   and product name are fixed server-side in `src/lib/membership/types.ts`; nothing about
   the price is ever trusted from the client.
3. **Email (optional)** — set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to send the
   post-activation confirmation email via [Resend](https://resend.com). Without it,
   membership activation still works; the email step just logs a warning and skips —
   a missing/broken email provider must never block or unwind an activation that's
   already been paid for.
4. **Admin dashboard** — set `ADMIN_USERNAME` and `ADMIN_PASSWORD` as Worker secrets
   (`npx wrangler secret put ADMIN_USERNAME`, etc.) and in `.dev.vars` locally. Without
   both set, `/admin/*` refuses all access — it never falls open. Pick a strong, unique
   password.

### How to access the admin dashboard

Visit `/admin/memberships` (or `/admin`, which redirects there) and sign in with the
`ADMIN_USERNAME`/`ADMIN_PASSWORD` credentials via your browser's HTTP Basic Auth prompt.
This is deliberately the simplest approach that's still secure over HTTPS — no login
page, session store, or new dependency, and it protects the dashboard page and its CSV
export identically (`src/middleware.ts` gates every `/admin/*` path; see
`src/lib/admin/auth.ts` for the full rationale and trade-offs). There's no logout beyond
closing the browser, and no per-admin accounts/audit trail — both fine for a single Forum
administrator, worth revisiting if that group grows. The dashboard is also excluded from
search indexing (`noindex` + `robots.txt`) as defense in depth, though auth is the actual
access control.

### How membership activation works

A membership is **never** marked active except in direct response to a confirmed Stripe
event:

1. Submitting the form creates a record with `paymentStatus: 'pending'` and starts a
   Stripe Checkout Session (server-computed €95.88 EUR, one annual payment — the client
   cannot influence price or currency).
2. Stripe's `checkout.session.completed` webhook (verified via the signing secret, using
   Web Crypto since Cloudflare Workers have no Node `crypto` module — see
   `src/lib/stripe.ts`) is the durable path that flips `paymentStatus` to `'paid'`,
   assigns the membership ID, and sets the 12-month start/expiry dates
   (`activateMembershipForSession` in `src/lib/membership/store.ts`). The
   `/membership/success` page independently performs the same activation as a
   best-effort fallback in case the webhook hasn't landed yet by the time the member's
   browser redirects back — both paths are idempotent and safe to run in either order or
   more than once.
3. `checkout.session.expired` and `checkout.session.async_payment_failed` mark the
   record `'cancelled'`/`'failed'` respectively — again, only when it's still `'pending'`
   and the event's session still matches the record's current session, so a
   late/duplicate/replayed event can never downgrade an already-active membership or
   resurrect a dead one into active.
4. If a member retries after a cancelled/failed payment, the client resubmits with the
   original `applicationId` and the server reuses that same record (new Stripe session,
   same application) rather than creating a new one — verified server-side against the
   submitted email before reuse is allowed, so a guessed id can't be used to tamper with
   someone else's application.

Explicit statuses (`src/lib/membership/status.ts`): **Pending**, **Active**,
**Expired**, **Cancelled**, **Payment Failed**.

### How membership expiry works

`isMembershipActive(record)` — the single source of truth for eligibility — checks
`paymentStatus === 'paid'` and `expiryDate > now` **on every call**, not a stored flag a
cron job would need to flip. A membership becomes ineligible the instant its expiry date
passes, with nothing scheduled required for that to take effect. `getDisplayStatus()`
builds on it to report `'Expired'` instead of `'Active'` once that date has passed.

### How event eligibility verification works

`POST /api/membership/verify` is a public endpoint meant to be called by the Forum's
(future) event ticketing system. Send `{ "membershipId": "ADCF-M-000124" }` or
`{ "email": "member@example.com" }` (exactly one); it returns only
`{ valid, membershipType, expiryDate, discountPercentage }` for an active Professional
Member, or uniformly `{ valid: false }` for anything else (expired, cancelled, pending,
or simply not found) — deliberately never the member's name, organisation, or any other
personal/professional detail, and deliberately uniform so the endpoint can't be used to
enumerate which emails/IDs exist. Automated discount application at event checkout is
**not** built yet — this endpoint is the eligibility check that integration would call.

### How to export members

From `/admin/memberships`, "Export CSV" downloads every application (search/status
filters affect only the on-screen table, not the export) with: Membership ID, First
Name, Last Name, Email, Organisation, Job Title, Country, Membership Type, Start Date,
Expiry Date, Status, Payment Status. It deliberately excludes Stripe customer/payment
references and anything else not needed for membership administration (those references
are still visible on-screen in the dashboard table for support/troubleshooting).

### How to test the payment flow

With `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` set to **test-mode** values:

```sh
npm run dev
stripe listen --forward-to localhost:4321/api/membership/webhook   # prints a whsec_... to use locally
```

Submit the form with a [Stripe test card](https://docs.stripe.com/testing) (e.g.
`4242 4242 4242 4242`, any future expiry/CVC) to exercise the full success path, or use
Stripe's "fail this payment"/"expire this session" test options and the cancel link on
Stripe's own page to exercise the failure/cancellation paths. `stripe trigger
checkout.session.expired` (etc.) can also simulate events directly.

### What's stored, and why (privacy)

Every field collected on the form, plus: `applicationId` (internal key), `membershipId`
once assigned, `paymentStatus`, `startDate`/`expiryDate` once activated, and three Stripe
reference ids (`stripeCheckoutSessionId`, `stripeCustomerId`, `stripePaymentIntentId`) —
never card details or other payment instrument data, which Stripe holds and this project
never sees. Nothing is collected beyond what's needed to administer membership and
verify event eligibility. The admin dashboard and CSV export are the only places this
data is surfaced in bulk, both behind the auth described above; the public verification
endpoint above is deliberately minimal-disclosure. There is currently no data-retention
policy (e.g. auto-deleting long-abandoned pending/failed applications) — worth adding if
this becomes a compliance requirement.

### Known limitations

- **KV is not transactional.** The sequential membership ID counter and the
  webhook/success-page activation race are both best-effort read-then-write, documented
  in detail in `src/lib/membership/store.ts`. At this project's expected volume (a
  professional membership programme, not high-frequency checkout) a collision is
  extremely unlikely but not impossible. If that ever changes, move the counter to a
  Cloudflare Durable Object (or a real database with transactions) — do not try to
  "fix" this with more KV calls; Cloudflare KV is globally eventually-consistent, so no
  read-check-then-write pattern built on it is actually atomic.
- **The admin dashboard lists the full table on every request** (`listAllMembers` reads
  one KV `list()` pass with no per-record `get`, so it stays cheap regardless of size,
  but has no server-side pagination). Fine at expected membership volumes; revisit if
  the table grows into the thousands.
- **No automated event-discount application yet** — `/api/membership/verify` is the
  eligibility check; wiring it into actual event checkout is a separate, not-yet-built
  integration.
- **No rate limiting on public API routes** (`/api/membership/checkout`,
  `/api/membership/verify`, the webhook). The webhook is protected by signature
  verification regardless; the other two would benefit from a Cloudflare WAF rate-limit
  rule at the zone level before launch if abuse becomes a concern — this is a dashboard
  configuration, not application code.
- **Single shared admin credential**, no per-admin accounts or audit log of who viewed
  or exported what. Acceptable for one Forum administrator today.

Key files: `src/lib/membership/` (schema, types, status logic, KV store),
`src/lib/stripe.ts`, `src/lib/email/sendMembershipEmail.ts`, `src/lib/admin/auth.ts`,
`src/middleware.ts`, `src/pages/api/membership/` (checkout, webhook, verify),
`src/pages/admin/` (dashboard, CSV export), `src/pages/membership.astro` and
`src/pages/membership/success.astro`, and the form itself in
`src/components/membership/`.

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
