import { TOOL_CONFIG, type ToolSlug } from "@/lib/utils";

export type FormatValue =
  | "any"
  | "mov"
  | "jpg"
  | "png"
  | "webp"
  | "gif"
  | "avif"
  | "bmp"
  | "tiff"
  | "heic"
  | "pdf"
  | "docx";

export interface FormatOption {
  value: FormatValue;
  label: string;
}

export interface ConverterPair {
  source: FormatValue;
  target: FormatValue;
}

export const FORMAT_OPTIONS: FormatOption[] = [
  { value: "any", label: "Any" },
  { value: "mov", label: "MOV" },
  { value: "jpg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
  { value: "gif", label: "GIF" },
  { value: "avif", label: "AVIF" },
  { value: "bmp", label: "BMP" },
  { value: "tiff", label: "TIFF" },
  { value: "heic", label: "HEIC" },
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "DOCX" },
];

export const HERO_ROTATING_PAIRS: ConverterPair[] = [
  { source: "mov", target: "gif" },
  { source: "png", target: "webp" },
  { source: "heic", target: "jpg" },
  { source: "pdf", target: "docx" },
  { source: "jpg", target: "png" },
];

export function isValidConverterSelection(
  source: FormatValue,
  target: FormatValue,
): boolean {
  if (source === "any" || target === "any") return false;
  return source !== target;
}

function formatLabel(value: FormatValue): string {
  if (value === "any") return "Any";
  return value.toUpperCase();
}

const PAIR_TOOL_MAP: Partial<
  Record<
    `${Exclude<FormatValue, "any">}-${Exclude<FormatValue, "any">}`,
    ToolSlug
  >
> = {
  "heic-jpg": "heic-to-jpg",
  "png-webp": "image-to-webp",
  "jpg-webp": "image-to-webp",
  "gif-webp": "image-to-webp",
  "avif-webp": "image-to-webp",
  "bmp-webp": "image-to-webp",
  "tiff-webp": "image-to-webp",
  "png-jpg": "image-to-jpg",
  "webp-jpg": "image-to-jpg",
  "gif-jpg": "image-to-jpg",
  "avif-jpg": "image-to-jpg",
  "bmp-jpg": "image-to-jpg",
  "tiff-jpg": "image-to-jpg",
  "jpg-png": "image-to-png",
  "webp-png": "image-to-png",
  "gif-png": "image-to-png",
  "avif-png": "image-to-png",
  "bmp-png": "image-to-png",
  "tiff-png": "image-to-png",
  "heic-png": "image-to-png",
  "png-avif": "image-to-avif",
  "jpg-avif": "image-to-avif",
  "webp-avif": "image-to-avif",
  "gif-avif": "image-to-avif",
  "bmp-avif": "image-to-avif",
  "tiff-avif": "image-to-avif",
  "heic-avif": "image-to-avif",
  "png-gif": "image-to-gif",
  "jpg-gif": "image-to-gif",
  "webp-gif": "image-to-gif",
  "avif-gif": "image-to-gif",
  "bmp-gif": "image-to-gif",
  "tiff-gif": "image-to-gif",
  "heic-gif": "image-to-gif",
  "mov-gif": "image-to-gif",
  "png-bmp": "image-to-bmp",
  "jpg-bmp": "image-to-bmp",
  "webp-bmp": "image-to-bmp",
  "gif-bmp": "image-to-bmp",
  "avif-bmp": "image-to-bmp",
  "tiff-bmp": "image-to-bmp",
  "heic-bmp": "image-to-bmp",
  "png-tiff": "image-to-tiff",
  "jpg-tiff": "image-to-tiff",
  "webp-tiff": "image-to-tiff",
  "gif-tiff": "image-to-tiff",
  "avif-tiff": "image-to-tiff",
  "bmp-tiff": "image-to-tiff",
  "heic-tiff": "image-to-tiff",
  "jpg-pdf": "image-to-pdf",
  "png-pdf": "image-to-pdf",
  "webp-pdf": "image-to-pdf",
  "gif-pdf": "image-to-pdf",
  "bmp-pdf": "image-to-pdf",
  "tiff-pdf": "image-to-pdf",
  "heic-pdf": "image-to-pdf",
  "pdf-jpg": "pdf-to-jpg",
  "pdf-docx": "pdf-to-word",
};

const TARGET_TOOL_MAP: Partial<
  Record<Exclude<FormatValue, "any">, ToolSlug>
> = {
  webp: "image-to-webp",
  jpg: "image-to-jpg",
  png: "image-to-png",
  avif: "image-to-avif",
  gif: "image-to-gif",
  bmp: "image-to-bmp",
  tiff: "image-to-tiff",
  heic: "heic-to-jpg",
  pdf: "image-to-pdf",
  docx: "pdf-to-word",
};

export interface HeroCopy {
  title: string;
  highlight: string;
  description: string;
}

export const DEFAULT_HERO_COPY: HeroCopy = {
  title: "Convert any file.",
  highlight: "Free & instant.",
  description:
    "Images, PDFs, AI tools everything in one place. Zero cost, zero watermarks, zero registration.",
};

export function getHeroCopy(
  source: FormatValue,
  target: FormatValue,
): HeroCopy {
  if (source !== "any" && target !== "any" && source !== target) {
    const key =
      `${source}-${target}` as `${Exclude<FormatValue, "any">}-${Exclude<FormatValue, "any">}`;
    const tool = PAIR_TOOL_MAP[key];
    const config = tool ? TOOL_CONFIG[tool] : null;

    return {
      title: `${formatLabel(source)} to ${formatLabel(target)} Converter`,
      highlight: "Free & instant.",
      description:
        config?.longDesc ??
        `Convert ${formatLabel(source)} files to ${formatLabel(target)} instantly — free, private, and unlimited.`,
    };
  }

  if (source !== "any" && target === "any") {
    const tool = TARGET_TOOL_MAP[source as Exclude<FormatValue, "any">];
    const config = tool ? TOOL_CONFIG[tool] : null;
    return {
      title: `${formatLabel(source)} Converter`,
      highlight: "Free & instant.",
      description:
        config?.longDesc ??
        `Convert ${formatLabel(source)} files to any supported format. Free, unlimited, no signup required.`,
    };
  }

  if (target !== "any" && source === "any") {
    const tool = TARGET_TOOL_MAP[target as Exclude<FormatValue, "any">];
    const config = tool ? TOOL_CONFIG[tool] : null;
    return {
      title: `Convert to ${formatLabel(target)}`,
      highlight: "Free & instant.",
      description:
        config?.longDesc ??
        `Convert any supported file to ${formatLabel(target)}. Free, unlimited, no signup required.`,
    };
  }

  return DEFAULT_HERO_COPY;
}
