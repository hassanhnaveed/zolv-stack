# zolv-stack

Open-source, free file conversion toolkit built with Next.js.

Convert images and documents in the browser — no account required for core tools.

## Features

- Image conversion (JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, HEIC)
- Image to PDF
- PDF merge, compress, split, and related document tools
- Health check endpoint at `/api/health`

## Stack


| Tool         | Version |
| ------------ | ------- |
| Next.js      | 16      |
| React        | 19      |
| Sharp        | 0.34    |
| Tailwind CSS | v4      |
| pdf-lib      | 1.17    |


## Requirements

- Node.js LTS
- npm

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env example and edit if needed
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

- `NEXT_PUBLIC_APP_URL` — recommended; public URL used for metadata, sitemap, and robots.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — required for the Google Drive picker.
- `NEXT_PUBLIC_GOOGLE_API_KEY` — required for the Google Drive picker. Restrict it by HTTP referrer in Google Cloud.
- `NEXT_PUBLIC_GOOGLE_APP_ID` — optional Google Cloud project number; derived from the client ID when omitted.
- `NEXT_PUBLIC_CLARITY_PROJECT_ID` — optional; enables Microsoft Clarity analytics.
- `SEO_INDEXING_ENABLED` — server-only; explicit opt-in for search indexing. See [SEO architecture](#seo-architecture) below.
- `SEO_GOOGLE_SITE_VERIFICATION` / `SEO_BING_SITE_VERIFICATION` — server-only Search Console / Bing Webmaster Tools verification tokens. Optional; leave blank until configured.

Never commit `.env`, `.env.local`, or SSH/private keys. Production secrets (deploy host, keys) belong in GitHub Environment secrets, not the repo.

## Scripts

```bash
npm run dev        # development
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run test       # Vitest
npm run seo:check  # SEO validation + audit report (reports/seo-audit.{md,json})
npm run build      # production build
npm run start      # serve production build on port 3000
```

## SEO architecture

zolv-stack centralizes all SEO (metadata, Open Graph/Twitter, JSON-LD,
sitemap, robots, verification) in `lib/seo/*`, driven by a single route
registry (`lib/seo/routes.ts`). Indexing is fail-closed and explicit
opt-in per route: outside a recognized production environment with
`SEO_INDEXING_ENABLED=true`, every route is non-indexable and the sitemap
is empty, even if a route declares `index: true`. Today, only the home page
and the Fileora hub are declared indexable; individual Fileora tools stay
`index: false` until each one passes the index quality gate documented in
`lib/seo/routes.ts`.

Run `npm run seo:check` to validate the registry and write a human-readable
audit report to `reports/seo-audit.md`. Set `NEXT_PUBLIC_APP_URL` to a valid
HTTPS origin first (a placeholder like `https://example.com` is fine before
a production domain is purchased):

```bash
NEXT_PUBLIC_APP_URL=https://example.com npm run seo:check
```

Runbooks:

- [`docs/seo/url-policy.md`](docs/seo/url-policy.md) — canonical URL contract
- [`docs/seo/search-console.md`](docs/seo/search-console.md) — Google Search Console / Bing Webmaster Tools setup and per-deploy/per-release checklists
- [`docs/seo/performance-budgets.md`](docs/seo/performance-budgets.md) — Core Web Vitals budgets per route type
- [`docs/seo/rollback.md`](docs/seo/rollback.md) — safe rollback of indexing, verification, and metadata changes



## Contributing

Contributions are welcome, including bug fixes, documentation improvements, new converters, accessibility improvements, and performance work.

### Contribution workflow

1. Fork the repository on GitHub.
2. Clone your fork and install dependencies:
  ```bash
   git clone https://github.com/<your-username>/zolv-stack.git
   cd zolv-stack
   npm install
   cp .env.example .env.local
  ```
3. Create a focused branch from the latest `main`:
  ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/short-description
  ```
   Use `feature/` for functionality, `fix/` for bug fixes, `docs/` for documentation, and `chore/` for tooling or maintenance.
4. Make and test your changes. Keep pull requests focused on one concern and follow the existing TypeScript, React, and Next.js patterns.
5. Run the local quality checks:
  ```bash
   npm run lint
   npm run typecheck
   npm run build
  ```
6. Commit, push to your fork, and open a pull request into `main`:
  ```bash
   git add .
   git commit -m "Add a concise description of the change"
   git push -u origin feature/short-description
  ```



### Pull request expectations

- Explain what changed and why.
- Include clear testing steps.
- Link the related issue when one exists.
- Add screenshots for visible UI changes.
- Update documentation and `.env.example` when configuration changes.
- Ensure the PR CI checks pass: lint, typecheck, and production build.
- Do not include generated build output, credentials, private keys, or real environment values.

Husky installs with `npm install`. It runs staged-file linting and TypeScript checks before commits, then lint and typecheck before pushes.

### Adding or changing tools

- Keep tool metadata and format support aligned with the existing catalogs in `lib/`.
- Put server conversion behavior in the appropriate `app/api/` route.
- Add or update the corresponding page under `app/`.
- Validate input types and file-size limits at the API boundary.
- Update the README when the supported feature list changes.



### Issues and security

Search existing issues before opening a new one. For bugs, include reproduction steps, expected behavior, actual behavior, and relevant environment details.

Do not publish exploitable security vulnerabilities in a public issue. Contact the repository maintainer privately instead.

## Production notes

- Prefer reverse-proxying with Nginx to `127.0.0.1:3000`
- Keep the app process managed with PM2 (or systemd)
- Deploy secrets should stay in your host/CI secret store

Example health check:

```bash
curl http://127.0.0.1:3000/api/health
```
