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
    title: "WebP",
    description: "JPG, PNG , AVIF, BMP, TIFF, GIF, ",
    longDesc:
      "Convert any image to WebP format and reduce file size by up to 80% without losing quality. WebP is the modern image format supported by all browsers.",
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
      "image/heic": [".heic", ".heif"],
    },
    outputExt: ".webp",
    outputMime: "image/webp",
    icon: "🖼️",
    color: "#00D084",
  },
  "image-to-jpg": {
    slug: "image-to-jpg",
    title: "JPG",
    description: " WebP, AVIF, BMP, TIFF, GIF, PNG",
    longDesc:
      "Convert PNG, WebP, AVIF, BMP, TIFF, GIF, HEIC to JPG format. Universal compatibility with all devices and platforms.",
    keywords: [
      "image to jpg",
      "png to jpg",
      "webp to jpg",
      "convert to jpg free",
    ],
    accept: {
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/avif": [".avif"],
      "image/bmp": [".bmp"],
      "image/tiff": [".tiff", ".tif"],
      "image/gif": [".gif"],
      "image/heic": [".heic", ".heif"],
    },
    outputExt: ".jpg",
    outputMime: "image/jpeg",
    icon: "🔄",
    color: "#F59E0B",
  },
  "image-to-png": {
    slug: "image-to-png",
    title: "PNG",
    description: "JPG, WebP, AVIF, BMP, TIFF, GIF, ",
    longDesc:
      "Convert JPG, WebP, AVIF, BMP, TIFF, GIF, HEIC to PNG format with transparency support.",
    keywords: [
      "image to png",
      "jpg to png",
      "webp to png",
      "convert to png free",
    ],
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "image/avif": [".avif"],
      "image/bmp": [".bmp"],
      "image/tiff": [".tiff", ".tif"],
      "image/gif": [".gif"],
      "image/heic": [".heic", ".heif"],
    },
    outputExt: ".png",
    outputMime: "image/png",
    icon: "🖼️",
    color: "#06B6D4",
  },
  "image-to-avif": {
    slug: "image-to-avif",
    title: " AVIF",
    description: "JPG, PNG , WebP, BMP, TIFF, GIF, ",
    longDesc:
      "Convert any image to AVIF format — the newest and most efficient image format with better compression than WebP.",
    keywords: [
      "image to avif",
      "jpg to avif",
      "png to avif",
      "convert to avif free",
    ],
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
      "image/bmp": [".bmp"],
      "image/tiff": [".tiff", ".tif"],
      "image/heic": [".heic", ".heif"],
    },
    outputExt: ".avif",
    outputMime: "image/avif",
    icon: "⚡",
    color: "#10B981",
  },
  "image-to-gif": {
    slug: "image-to-gif",
    title: "GIF",
    description: "JPG, WebP, AVIF, BMP, TIFF, PNG",
    longDesc:
      "Convert JPG, PNG, WebP images to GIF format. Perfect for simple graphics and icons.",
    keywords: [
      "image to gif",
      "jpg to gif",
      "png to gif",
      "convert to gif free",
    ],
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/bmp": [".bmp"],
      "image/tiff": [".tiff", ".tif"],
      "image/avif": [".avif"],
      "image/heic": [".heic", ".heif"],
    },
    outputExt: ".gif",
    outputMime: "image/gif",
    icon: "🎞️",
    color: "#F43F5E",
  },
  "image-to-bmp": {
    slug: "image-to-bmp",
    title: "BMP",
    description: "JPG, PNG, WebP, AVIF, TIFF, GIF ",
    longDesc:
      "Convert JPG, PNG, WebP images to BMP format. Uncompressed format for maximum compatibility with Windows applications.",
    keywords: [
      "image to bmp",
      "jpg to bmp",
      "png to bmp",
      "convert to bmp free",
    ],
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/avif": [".avif"],
      "image/gif": [".gif"],
      "image/tiff": [".tiff", ".tif"],
      "image/heic": [".heic", ".heif"],
    },
    outputExt: ".bmp",
    outputMime: "image/bmp",
    icon: "🗂️",
    color: "#8B5CF6",
  },
  "image-to-tiff": {
    slug: "image-to-tiff",
    title: "TIFF",
    description: "JPG, PNG, WebP, AVIF, BMP, GIF",
    longDesc:
      "Convert JPG, PNG, WebP images to TIFF format. High quality lossless format for professional photography and printing.",
    keywords: [
      "image to tiff",
      "jpg to tiff",
      "png to tiff",
      "convert to tiff free",
    ],
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/avif": [".avif"],
      "image/gif": [".gif"],
      "image/bmp": [".bmp"],
      "image/heic": [".heic", ".heif"],
    },
    outputExt: ".tiff",
    outputMime: "image/tiff",
    icon: "📷",
    color: "#EC4899",
  },
  "heic-to-jpg": {
    slug: "heic-to-jpg",
    title: "HEIC ",
    description: "JPG, WebP, AVIF, BMP, TIFF, GIF, PNG",
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
    description: "Convert any image to PDF document",
    longDesc:
      "Turn one or multiple images into a single PDF document. Perfect for sharing, printing, or archiving photos and scans.",
    keywords: [
      "image to pdf",
      "jpg to pdf",
      "png to pdf",
      "convert image to pdf free online",
    ],
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/bmp": [".bmp"],
      "image/tiff": [".tiff", ".tif"],
      "image/gif": [".gif"],
      "image/heic": [".heic", ".heif"],
    },
    outputExt: ".pdf",
    outputMime: "application/pdf",
    icon: "📄",
    color: "#F43F5E",
  },
  "pdf-merge": {
    slug: "pdf-merge",
    title: "PDF Merge",
    description: "Combine multiple PDFs into one file",
    longDesc: "Merge multiple PDF files into one document in seconds.",
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
      "Compress PDF files to reduce their size for easy sharing via email or upload.",
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
  "pdf-to-jpg": {
    slug: "pdf-to-jpg",
    title: "PDF to JPG",
    description: "Convert PDF pages to JPG images",
    longDesc:
      "Extract pages from any PDF and convert them to high quality JPG images.",
    keywords: ["pdf to jpg", "pdf to image", "convert pdf to jpg online free"],
    accept: { "application/pdf": [".pdf"] },
    outputExt: ".jpg",
    outputMime: "image/jpeg",
    icon: "🖼️",
    color: "#F59E0B",
  },
  "pdf-split": {
    slug: "pdf-split",
    title: "PDF Split",
    description: "Split a PDF into separate pages or page ranges",
    longDesc:
      "Split any PDF into individual pages or custom page ranges. Extract exactly the pages you need and download them as separate PDF files. Free, unlimited, no signup.",
    keywords: [
      "split pdf online free",
      "pdf splitter",
      "extract pdf pages",
      "separate pdf pages",
      "pdf page extractor",
    ],
    accept: { "application/pdf": [".pdf"] },
    outputExt: ".pdf",
    outputMime: "application/pdf",
    icon: "✂️",
    color: "#F59E0B",
  },
  "pdf-to-word": {
    slug: "pdf-to-word",
    title: "PDF to Word",
    description: "Convert PDF to editable Word document",
    longDesc:
      "Convert any PDF to an editable Word (.docx) document. Preserves formatting, tables, and text. Free, unlimited, no signup required.",
    keywords: [
      "pdf to word",
      "pdf to docx",
      "convert pdf to word online free",
      "pdf to word converter",
    ],
    accept: { "application/pdf": [".pdf"] },
    outputExt: ".docx",
    outputMime:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    icon: "📝",
    color: "#2563EB",
  },
  "image-enhance": {
    slug: "image-enhance",
    title: "Image Enhancer",
    description: "Enhance & upscale images with AI",
    longDesc:
      "Powered by Real-ESRGAN AI — upscale and enhance any image 2x. Sharpen blurry photos, boost details, improve quality instantly.",
    keywords: [
      "ai image enhancer",
      "sharpen image online free",
      "upscale image",
      "improve image quality",
    ],
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/bmp": [".bmp"],
    },
    outputExt: ".png",
    outputMime: "image/png",
    icon: "✨",
    color: "#8B5CF6",
  },
  "remove-bg": {
    slug: "remove-bg",
    title: "Background Remover",
    description: "Remove image background instantly with AI",
    longDesc:
      "Remove the background from any image automatically using AI. Perfect for product photos, portraits, and graphics. Free, unlimited, no signup required.",
    keywords: [
      "remove background online free",
      "background remover ai",
      "transparent background image",
      "remove bg free unlimited",
    ],
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    outputExt: ".png",
    outputMime: "image/png",
    icon: "🪄",
    color: "#06B6D4",
  },
  "docx-to-pdf": {
    slug: "docx-to-pdf",
    title: "DOCX to PDF",
    description: "Convert Word document to PDF",
    longDesc:
      "Convert any Word (.docx) document to PDF format. Preserves formatting, images, and layout. Free, unlimited, no signup required.",
    keywords: [
      "docx to pdf",
      "word to pdf",
      "convert docx to pdf online free",
    ],
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    outputExt: ".pdf",
    outputMime: "application/pdf",
    icon: "📄",
    color: "#2563EB",
  },
  "pdf-to-txt": {
    slug: "pdf-to-txt",
    title: "PDF to TXT",
    description: "Extract text from PDF",
    longDesc:
      "Extract all text content from any PDF and download it as a plain .txt file. Free, unlimited, no signup required.",
    keywords: [
      "pdf to txt",
      "extract text from pdf",
      "convert pdf to text online free",
    ],
    accept: { "application/pdf": [".pdf"] },
    outputExt: ".txt",
    outputMime: "text/plain",
    icon: "📝",
    color: "#10B981",
  },
  "doc-to-pdf": {
    slug: "doc-to-pdf",
    title: "DOC to PDF",
    description: "Convert old Word document to PDF",
    longDesc:
      "Convert legacy .doc Word documents to PDF format. Free, unlimited, no signup.",
    keywords: ["doc to pdf", "convert doc to pdf online free"],
    accept: { "application/msword": [".doc"] },
    outputExt: ".pdf",
    outputMime: "application/pdf",
    icon: "📄",
    color: "#2563EB",
  },
  "odt-to-pdf": {
    slug: "odt-to-pdf",
    title: "ODT to PDF",
    description: "Convert OpenDocument text to PDF",
    longDesc:
      "Convert ODT (OpenOffice/LibreOffice) documents to PDF format. Free, unlimited, no signup.",
    keywords: ["odt to pdf", "convert odt to pdf online free"],
    accept: { "application/vnd.oasis.opendocument.text": [".odt"] },
    outputExt: ".pdf",
    outputMime: "application/pdf",
    icon: "📄",
    color: "#0EA5E9",
  },
  "rtf-to-pdf": {
    slug: "rtf-to-pdf",
    title: "RTF to PDF",
    description: "Convert Rich Text Format to PDF",
    longDesc: "Convert RTF documents to PDF format. Free, unlimited, no signup.",
    keywords: ["rtf to pdf", "convert rtf to pdf online free"],
    accept: { "application/rtf": [".rtf"], "text/rtf": [".rtf"] },
    outputExt: ".pdf",
    outputMime: "application/pdf",
    icon: "📄",
    color: "#F59E0B",
  },
  "txt-to-pdf": {
    slug: "txt-to-pdf",
    title: "TXT to PDF",
    description: "Convert plain text file to PDF",
    longDesc:
      "Convert plain .txt text files to PDF format. Free, unlimited, no signup.",
    keywords: ["txt to pdf", "convert text file to pdf online free"],
    accept: { "text/plain": [".txt"] },
    outputExt: ".pdf",
    outputMime: "application/pdf",
    icon: "📄",
    color: "#10B981",
  },
  "html-to-pdf": {
    slug: "html-to-pdf",
    title: "HTML to PDF",
    description: "Convert HTML file to PDF",
    longDesc: "Convert HTML web pages/files to PDF format. Free, unlimited, no signup.",
    keywords: ["html to pdf", "convert html to pdf online free"],
    accept: { "text/html": [".html", ".htm"] },
    outputExt: ".pdf",
    outputMime: "application/pdf",
    icon: "📄",
    color: "#EC4899",
  },
  "md-to-pdf": {
    slug: "md-to-pdf",
    title: "Markdown to PDF",
    description: "Convert Markdown file to PDF",
    longDesc: "Convert .md Markdown files to PDF format. Free, unlimited, no signup.",
    keywords: ["markdown to pdf", "md to pdf converter online free"],
    accept: { "text/markdown": [".md"] },
    outputExt: ".pdf",
    outputMime: "application/pdf",
    icon: "📄",
    color: "#6366F1",
  },
} as const;

export type ToolSlug = keyof typeof TOOL_CONFIG;

// Sab image output formats
const ALL_IMAGE_OUTPUTS: ToolSlug[] = [
  "image-to-webp",
  "image-to-jpg",
  "image-to-png",
  "image-to-avif",
  "image-to-gif",
  "image-to-bmp",
  "image-to-tiff",
  "image-to-pdf",
];

export const FORMAT_OUTPUT_MAP: Record<string, ToolSlug[]> = {
  "image/jpeg": ALL_IMAGE_OUTPUTS.filter((t) => t !== "image-to-jpg"),
  "image/jpg": ALL_IMAGE_OUTPUTS.filter((t) => t !== "image-to-jpg"),
  "image/png": ALL_IMAGE_OUTPUTS.filter((t) => t !== "image-to-png"),
  "image/gif": ALL_IMAGE_OUTPUTS.filter((t) => t !== "image-to-gif"),
  "image/bmp": ALL_IMAGE_OUTPUTS.filter((t) => t !== "image-to-bmp"),
  "image/tiff": ALL_IMAGE_OUTPUTS.filter((t) => t !== "image-to-tiff"),
  "image/avif": ALL_IMAGE_OUTPUTS.filter((t) => t !== "image-to-avif"),
  "image/webp": ALL_IMAGE_OUTPUTS.filter((t) => t !== "image-to-webp"),
  "image/heic": ALL_IMAGE_OUTPUTS,
  "image/heif": ALL_IMAGE_OUTPUTS,
  "application/pdf": [
    "pdf-merge",
    "pdf-compress",
    "pdf-to-jpg",
    "pdf-to-word",
    "pdf-to-txt",
  ],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    "docx-to-pdf",
  ],
  "application/msword": ["doc-to-pdf"],
  "application/vnd.oasis.opendocument.text": ["odt-to-pdf"],
  "application/rtf": ["rtf-to-pdf"],
  "text/rtf": ["rtf-to-pdf"],
  "text/plain": ["txt-to-pdf"],
  "text/html": ["html-to-pdf"],
  "text/markdown": ["md-to-pdf"],
};

// export const TOOL_CATEGORIES: Record<string, ToolSlug[]> = {
//   image: [
//     "image-to-webp",
//     "image-to-jpg",
//     "image-to-png",
//     "image-to-avif",
//     "image-to-gif",
//     "image-to-bmp",
//     "image-to-tiff",
//     "heic-to-jpg",
//     "image-to-pdf",
//     "image-enhance",
//     "remove-bg",
//   ],
//   document: [
//     "pdf-merge",
//     "pdf-compress",
//     "pdf-to-jpg",
//     "pdf-split",
//     "pdf-to-word",
//     "pdf-to-txt",
//     "docx-to-pdf",
//     "doc-to-pdf",
//     "odt-to-pdf",
//     "rtf-to-pdf",
//     "txt-to-pdf",
//     "html-to-pdf",
//     "md-to-pdf",
//   ],
// };

// new

export const TOOL_CATEGORIES: Record<string, ToolSlug[]> = {
  image: [
    "image-to-webp",
    "image-to-jpg",
    "image-to-png",
    "image-to-avif",
    "image-to-gif",
    "image-to-bmp",
    "image-to-tiff",
    "heic-to-jpg",
    "image-to-pdf",
  ],
  pdf: [
    "pdf-merge",
    "pdf-compress",
    "pdf-to-jpg",
    "pdf-split",
    "pdf-to-word",
    "pdf-to-txt",
  ],
  document: [
    "docx-to-pdf",
    "doc-to-pdf",
    "odt-to-pdf",
    "rtf-to-pdf",
    "txt-to-pdf",
    "html-to-pdf",
    "md-to-pdf",
  ],
  ai: ["image-enhance", "remove-bg"],
};