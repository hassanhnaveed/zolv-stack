import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

export function getSavingsPct(original: number, converted: number): string {
  if (original === 0) return "0";
  return ((1 - converted / original) * 100).toFixed(1);
}

export const TOOL_CONFIG = {
  "image-to-webp": {
    slug: "image-to-webp",
    title: "Image & PDF Converter",
    description: "Convert JPG, PNG, GIF, BMP, TIFF to WebP format",
    longDesc:
      "Convert WebP, JPG, JPEG, PNG, GIF, BMP, SVG, PDF, and many other formats quickly and easily. Fast, secure, and free online conversion with just a few clicks.",
    keywords: [
      "image to webp",
      "jpg to webp",
      "png to webp",
      "convert to webp free",
    ],
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/bmp": [".bmp"],
      "image/tiff": [".tiff", ".tif"],
      "image/avif": [".avif"],
    },
    outputExt: ".webp",
    outputMime: "image/webp",
    icon: "🖼️",
    color: "#00D084",
  },
  "webp-to-jpg": {
    slug: "webp-to-jpg",
    title: "WebP to JPG",
    description: "Convert WebP images back to JPG format",
    longDesc:
      "Need JPG compatibility? Convert WebP images to JPG instantly — perfect for apps and platforms that don't yet support WebP.",
    keywords: [
      "webp to jpg",
      "convert webp to jpeg",
      "webp to jpg online free",
    ],
    accept: { "image/webp": [".webp"] },
    outputExt: ".jpg",
    outputMime: "image/jpeg",
    icon: "🔄",
    color: "#00B8E0",
  },
  "webp-to-png": {
    slug: "webp-to-png",
    title: "WebP to PNG",
    description: "Convert WebP images to PNG with transparency",
    longDesc:
      "Convert WebP to PNG and preserve transparency. PNG is the go-to format for graphics with transparent backgrounds.",
    keywords: [
      "webp to png",
      "convert webp to png online",
      "webp png converter",
    ],
    accept: { "image/webp": [".webp"] },
    outputExt: ".png",
    outputMime: "image/png",
    icon: "🔁",
    color: "#A78BFA",
  },
  "heic-to-jpg": {
    slug: "heic-to-jpg",
    title: "HEIC to JPG",
    description: "Convert iPhone HEIC photos to JPG",
    longDesc:
      "Convert iPhone and iOS HEIC photos to universally compatible JPG format. Works on any device — no software needed.",
    keywords: [
      "heic to jpg",
      "heic to jpeg converter",
      "iphone heic to jpg online free",
    ],
    accept: { "image/heic": [".heic", ".heif"] },
    outputExt: ".jpg",
    outputMime: "image/jpeg",
    icon: "📱",
    color: "#F59E0B",
  },
  "image-to-pdf": {
    slug: "image-to-pdf",
    title: "Image to PDF",
    description: "Convert JPG, PNG images to PDF documents",
    longDesc:
      "Turn one or multiple images into a single PDF document. Perfect for sharing, printing, or archiving photos and scans.",
    keywords: [
      "image to pdf",
      "jpg to pdf",
      "png to pdf",
      "convert image to pdf free online",
    ],
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    outputExt: ".pdf",
    outputMime: "application/pdf",
    icon: "📄",
    color: "#F43F5E",
  },
  "pdf-merge": {
    slug: "pdf-merge",
    title: "PDF Merge",
    description: "Combine multiple PDFs into one file",
    longDesc:
      "Merge multiple PDF files into one document in seconds. Drag to reorder pages, then download the combined PDF.",
    keywords: [
      "merge pdf",
      "combine pdf files",
      "pdf merger online free",
      "join pdf",
    ],
    accept: { "application/pdf": [".pdf"] },
    outputExt: ".pdf",
    outputMime: "application/pdf",
    icon: "🔗",
    color: "#6366F1",
  },
  "pdf-compress": {
    slug: "pdf-compress",
    title: "PDF Compress",
    description: "Reduce PDF file size without quality loss",
    longDesc:
      "Compress PDF files to reduce their size for easy sharing via email or upload. No quality loss on text and vector content.",
    keywords: [
      "compress pdf",
      "reduce pdf size",
      "pdf compressor online free",
      "shrink pdf",
    ],
    accept: { "application/pdf": [".pdf"] },
    outputExt: ".pdf",
    outputMime: "application/pdf",
    icon: "⚡",
    color: "#EC4899",
  },
} as const;

export type ToolSlug = keyof typeof TOOL_CONFIG;
