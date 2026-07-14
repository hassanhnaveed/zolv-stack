# zolv-stack

Open-source, free file conversion toolkit built with Next.js.

Convert images and documents in the browser — no account required for core tools.

## Features

- Image conversion (JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, HEIC)
- Image to PDF
- PDF merge, compress, split, and related document tools
- Health check endpoint at `/api/health`

## Stack

| Tool | Version |
|------|---------|
| Next.js | 16 |
| React | 19 |
| Sharp | 0.34 |
| Tailwind CSS | v4 |
| pdf-lib | 1.17 |

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

| Name | Required | Description |
|------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Recommended | Public site URL used for metadata, sitemap, and robots (e.g. `https://yourdomain.com`) |

Never commit `.env`, `.env.local`, or SSH/private keys. Production secrets (deploy host, keys) belong in GitHub Environment secrets, not the repo.

## Scripts

```bash
npm run dev        # development
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # production build
npm run start      # serve production build on port 3000
```

## Contributing

1. Create a branch: `feature/...`, `fix/...`, or `chore/...`
2. Make your changes
3. Open a pull request into `main`
4. Ensure CI passes (lint, typecheck, build)

Husky runs lint + typecheck locally on commit/push to catch issues early.

## Production notes

- Prefer reverse-proxying with Nginx to `127.0.0.1:3000`
- Keep the app process managed with PM2 (or systemd)
- Deploy secrets should stay in your host/CI secret store

Example health check:

```bash
curl http://127.0.0.1:3000/api/health
```

## License

[MIT](./LICENSE)
