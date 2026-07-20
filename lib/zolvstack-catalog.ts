/** Shared ZolvStack company copy, product portfolio, and footer navigation. */

export const ZOLVSTACK_COMPANY = Object.freeze({
  name: "ZolvStack",
  tagline: "Fast, private tools for everyday work.",
  description:
    "ZolvStack builds free, browser-based tools that help people get things done — without subscriptions, watermarks, or unnecessary friction.",
  mission:
    "We build practical web tools that respect your time and privacy. Every product in the ZolvStack portfolio is designed to be fast, accessible, and free to use.",
  vision:
    "A growing ecosystem of focused tools — each excellent at one job, all united under a brand you can trust.",
} as const);

export type ZolvStackProduct = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  color: string;
  tags: readonly string[];
  status: "live" | "coming-soon";
};

export const ZOLVSTACK_PRODUCTS: readonly ZolvStackProduct[] = Object.freeze([
  {
    id: "fileora",
    name: "Fileora",
    tagline: "Free File Converter",
    description:
      "Convert images, PDFs, and documents in your browser. Remove backgrounds, merge and compress PDFs, and more — unlimited, no signup, no watermarks.",
    href: "/fileora",
    color: "#00D084",
    tags: ["Image Converter", "PDF Tools", "AI Enhancer", "Background Remover"],
    status: "live",
  },
]);

export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterSection = {
  title: string;
  links: readonly FooterLink[];
};

export const ZOLVSTACK_FOOTER_SECTIONS: readonly FooterSection[] = Object.freeze([
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Fileora", href: "/fileora" },
      { label: "All Products", href: "/products" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Documentation", href: "/docs" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
]);

export const ZOLVSTACK_NAV_LINKS: readonly FooterLink[] = Object.freeze([
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]);
