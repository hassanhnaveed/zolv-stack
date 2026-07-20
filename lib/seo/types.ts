/**
 * Shared SEO types for the `lib/seo/*` module (SEO Architecture v1.0).
 *
 * This file defines the vocabulary consumed by later modules (routes,
 * metadata, open-graph, schema, sitemap). Task 1 only introduces the types;
 * consuming modules are implemented in later tasks.
 */

/** Supported locale identifiers. Only "en" ships today; the shape stays
 * ready for future locales without requiring a breaking change. */
export type Locale = "en";

/** BCP47-ish tag used for `og:locale` / schema `inLanguage` (e.g. "en_US"). */
export type LocaleTag = "en_US";

/** Registered brand tokens. ZolvStack is the primary/root brand; Fileora is
 * a product nested under it. */
export type BrandId = "zolvstack" | "fileora";

/** Registered product identifiers. Mirrors `BrandId` for products that are
 * also independently brandable (e.g. Fileora). Extensible for future
 * products without touching existing entries. */
export type ProductId = "fileora";

/**
 * Page archetypes drive metadata/title patterns and JSON-LD registry
 * lookups. See spec "Brand & Title Patterns" and "Structured Data" tables.
 */
export type PageType =
  | "brand-home"
  | "brand-static"
  | "legal"
  | "product-hub"
  | "product-tool";

/** Independent indexing/crawling flags for a route (spec: "independent
 * flags"). `sitemap` must not be true unless `index` is also true; that
 * invariant is enforced by validators in a later task, not by the type. */
export interface IndexFlags {
  /** Whether the page may be indexed (robots `index`). */
  index: boolean;
  /** Whether the page appears in `sitemap.xml`. */
  sitemap: boolean;
  /** Whether crawlers may follow links from this page (robots `follow`). */
  follow: boolean;
}

/** Sitemap `changefreq` values per the sitemap protocol. */
export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

/** A normalized social share image, resolved once and reused for both
 * Open Graph and Twitter cards (spec: "no silent divergence"). */
export interface SocialImage {
  /** Absolute URL to the image asset. */
  url: string;
  /** Pixel width, when known. */
  width?: number;
  /** Pixel height, when known. */
  height?: number;
  /** MIME type, when known (e.g. "image/png"). */
  type?: string;
  /** Required, meaningful alt text — never generic ("image", "logo"). */
  alt: string;
}

/** A single real FAQ entry. Never fabricate content; omit the field
 * entirely on a route unless the copy is accurate and reviewed. */
export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * SSOT route entry (implemented fully in `routes.ts`, Task 2). Declared here
 * so later modules (metadata, schema, sitemap) can depend on the shape
 * without a circular dependency on `routes.ts` itself.
 */
export interface SeoRoute extends IndexFlags {
  /** Stable identifier used to look up the route (e.g. "FILEORA_HUB"). */
  id: string;
  /** Site-relative path, always leading-slash, kebab-case, no trailing
   * slash except for the root path "/". */
  path: string;
  /** Owning product, or `undefined` for root ZolvStack pages. */
  product?: ProductId;
  /** Page archetype driving metadata/schema selection. */
  pageType: PageType;
  /**
   * SEO title override.
   *
   * - For non-tool page types (`brand-home`, `brand-static`, `legal`,
   *   `product-hub`): the **final** document title as authored (already
   *   brand-composed, e.g. `"About | ZolvStack"`).
   * - For `product-tool`: the **intent** title only (e.g.
   *   `"Convert Images to WebP Free"`). Brand composition
   *   (`"{intent} | Fileora by ZolvStack"`) happens exactly once in
   *   `resolveFinalTitle` — do not store an already-suffixed final string
   *   here. May be omitted to fall back to `TOOL_CONFIG` / slug-derived
   *   intent via the content resolver.
   */
  title?: string;
  /** SEO description. May be omitted for tools that fall back to
   * `TOOL_CONFIG`. */
  description?: string;
  /** Sitemap priority (0.0–1.0), optional. */
  sitemapPriority?: number;
  /** Sitemap `changefreq`, optional. */
  changeFrequency?: ChangeFrequency;
  /** ISO 8601 last-modified date. Never fabricate "now"; omit unless a
   * real modification date is known. */
  lastModified?: string;
  /** Explicit Open Graph image override for this route. */
  ogImage?: SocialImage;
  /** SEO keywords. Omit unless explicitly authored (spec: "optional;
   * omit unless explicitly set"). */
  keywords?: string[];
  /** Real FAQ content only. */
  faq?: FaqEntry[];
}

/** Result of resolving the site origin from environment configuration. */
export interface SiteOrigin {
  /** Fully-qualified origin with no trailing slash (e.g.
   * "https://example.com"). */
  origin: string;
  /** Parsed protocol, e.g. "https". */
  protocol: string;
  /** Parsed hostname, e.g. "example.com". */
  hostname: string;
}
