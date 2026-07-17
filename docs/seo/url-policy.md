# SEO URL Policy (Architecture v1.0)

Canonical URL contract for zolv-stack. Binding for all `lib/seo/*` consumers.

## Origin source of truth

- The only origin source is `NEXT_PUBLIC_APP_URL`.
- There are **no** hard-coded fallbacks (no Netlify, Fileora domain, or guessed production host).

## Stricter environment behavior

`getSiteOrigin()` requires a valid `NEXT_PUBLIC_APP_URL` in **every** environment:

- development
- test
- production

Missing, blank, or invalid values throw. This is intentional and stricter than “production-only validation,” so incomplete env configuration fails loudly instead of emitting wrong canonicals/OG/schema URLs.

Local development should set:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Valid origin shape

`NEXT_PUBLIC_APP_URL` must be an absolute URL that:

- has **no** username/password credentials
- has **no** query string
- has **no** fragment
- has **no** pathname other than `/`
- uses **`https`** in production
- may use `http` or `https` outside production (e.g. localhost)

Trailing slashes on the configured origin are normalized away via `URL.origin`.

## Path policy

- Root path: `/`
- All other paths: lowercase kebab-case, leading slash, **no** trailing slash
- Canonicals are always absolute and derived from route definitions + `getSiteOrigin()` / `absoluteUrl()`
- Locale prefixes are reserved for future i18n; English currently emits no prefix

## Related APIs

- `getSiteOrigin()` — validate and resolve origin
- `absoluteUrl(path, locale?)` — join origin + path

See also: SEO Architecture v1.0 design spec.
