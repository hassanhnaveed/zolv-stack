# Convoox

Free, unlimited, no-watermark file conversion tool.
Built with Next.js 16, Sharp, Tailwind CSS v4, pdf-lib.

## Tools included
- Image → WebP
- WebP → JPG
- WebP → PNG
- HEIC → JPG
- Image → PDF
- PDF Merge
- PDF Compress
- PDF To JGP

## Stack
| Tool | Version |
|------|---------|
| Next.js | 16.2.4 |
| React | 19.1 |
| Sharp | 0.34.5 |
| Tailwind CSS | v4.1.6 |
| pdf-lib | 1.17.1 |
| Framer Motion | 11.x |

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local
.env.local
# Edit NEXT_PUBLIC_APP_URL to your domain

# 3. Run dev server
npm run dev
```

Open http://localhost:3000

## Production (VPS)

```bash
npm run build
npm start
```

### With PM2
```bash
npm install -g pm2
pm2 start npm --name "Convoox" -- start
pm2 save && pm2 startup
```

### Nginx config
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    client_max_body_size 55M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

SSL: `certbot --nginx -d yourdomain.com`

## Adding Google Ads (future)

In `app/layout.tsx`, add inside `<head>`:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX" crossOrigin="anonymous"></script>
```

Then place `<ins class="adsbygoogle">` components where needed.

## Adding new tools (future)

1. Add config to `lib/utils.ts` TOOL_CONFIG
2. Add conversion logic to `app/api/convert/route.ts` or `app/api/pdf/route.ts`
3. Create `app/(tools)/new-tool/page.tsx` using `<ToolPage slug="new-tool" />`
4. Done!

## SEO checklist
- [x] Per-page metadata (title, description, canonical)
- [x] Open Graph tags
- [x] JSON-LD Schema markup
- [x] sitemap.xml
- [x] robots.txt
- [x] Security headers
- [x] Mobile responsive
- [x] Core Web Vitals optimized (Turbopack, Sharp server-side)
