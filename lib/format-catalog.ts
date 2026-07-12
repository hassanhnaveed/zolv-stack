import { FORMAT_OUTPUT_MAP, TOOL_CONFIG, type ToolSlug } from "@/lib/utils";

export type FormatValue =
  | "any"
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

/** Conversion tools available in the project (excludes AI utilities). */
export const CONVERTER_TOOLS: ToolSlug[] = [
  "image-to-webp",
  "image-to-jpg",
  "image-to-png",
  "image-to-avif",
  "image-to-gif",
  "image-to-bmp",
  "image-to-tiff",
  "heic-to-jpg",
  "image-to-pdf",
  "pdf-merge",
  "pdf-compress",
  "pdf-to-jpg",
  "pdf-to-word",
];

const FORMAT_LABELS: Record<Exclude<FormatValue, "any">, string> = {
  jpg: "JPG",
  png: "PNG",
  webp: "WebP",
  gif: "GIF",
  avif: "AVIF",
  bmp: "BMP",
  tiff: "TIFF",
  heic: "HEIC",
  pdf: "PDF",
  docx: "DOCX",
};

const MIME_TO_FORMAT: Record<string, FormatValue> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/heic": "heic",
  "image/heif": "heic",
  "application/pdf": "pdf",
};

const FORMAT_TO_MIME: Partial<Record<Exclude<FormatValue, "any">, string>> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  bmp: "image/bmp",
  tiff: "image/tiff",
  heic: "image/heic",
  pdf: "application/pdf",
};

/** Input formats supported by the upload widget and conversion APIs. */
export const SOURCE_FORMATS: Exclude<FormatValue, "any" | "docx">[] = [
  "jpg",
  "png",
  "webp",
  "gif",
  "avif",
  "bmp",
  "tiff",
  "heic",
  "pdf",
];

function toFormatOption(value: FormatValue): FormatOption {
  if (value === "any") return { value, label: "Any" };
  return { value, label: FORMAT_LABELS[value] };
}

export function getSourceFormatOptions(): FormatOption[] {
  return [
    { value: "any", label: "Any" },
    ...SOURCE_FORMATS.map((value) => toFormatOption(value)),
  ];
}

function toolToTargetFormat(tool: ToolSlug): FormatValue | null {
  if (tool === "pdf-to-word") return "docx";
  if (
    tool === "pdf-merge" ||
    tool === "pdf-compress" ||
    tool === "pdf-split" ||
    tool === "image-to-pdf"
  ) {
    return "pdf";
  }

  const ext = TOOL_CONFIG[tool].outputExt.replace(".", "").toLowerCase();
  if (ext === "jpeg") return "jpg";
  if (ext === "tiff") return "tiff";
  if (ext in FORMAT_LABELS) return ext as Exclude<FormatValue, "any" | "docx">;
  return null;
}

function collectTargetFormats(source: FormatValue): FormatValue[] {
  const targets = new Set<FormatValue>();

  if (source === "any") {
    for (const mime of Object.keys(FORMAT_OUTPUT_MAP)) {
      for (const tool of FORMAT_OUTPUT_MAP[mime] ?? []) {
        const target = toolToTargetFormat(tool);
        if (target) targets.add(target);
      }
    }
    return Array.from(targets);
  }

  const mime = FORMAT_TO_MIME[source as Exclude<FormatValue, "any" | "docx">];
  if (!mime) return [];

  for (const tool of FORMAT_OUTPUT_MAP[mime] ?? []) {
    const target = toolToTargetFormat(tool);
    if (target && target !== source) targets.add(target);
  }

  return Array.from(targets);
}

export function getTargetFormatOptions(source: FormatValue): FormatOption[] {
  return [
    { value: "any", label: "Any" },
    ...collectTargetFormats(source).map((value) => toFormatOption(value)),
  ];
}

/** @deprecated Use getSourceFormatOptions / getTargetFormatOptions */
export const FORMAT_OPTIONS: FormatOption[] = getSourceFormatOptions();

export const HERO_ROTATING_PAIRS: ConverterPair[] = [
  { source: "png", target: "webp" },
  { source: "heic", target: "jpg" },
  { source: "pdf", target: "docx" },
  { source: "jpg", target: "png" },
  { source: "webp", target: "pdf" },
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
  return FORMAT_LABELS[value];
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
  "avif-pdf": "image-to-pdf",
  "pdf-jpg": "pdf-to-jpg",
  "pdf-docx": "pdf-to-word",
};

const SOURCE_TOOL_MAP: Partial<
  Record<Exclude<FormatValue, "any" | "docx">, ToolSlug>
> = {
  jpg: "image-to-jpg",
  png: "image-to-png",
  webp: "image-to-webp",
  gif: "image-to-gif",
  avif: "image-to-avif",
  bmp: "image-to-bmp",
  tiff: "image-to-tiff",
  heic: "heic-to-jpg",
  pdf: "pdf-to-jpg",
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

export function resolveToolFromFormats(
  source: FormatValue,
  target: FormatValue,
): ToolSlug | null {
  if (source !== "any" && target !== "any" && source !== target) {
    const key =
      `${source}-${target}` as `${Exclude<FormatValue, "any">}-${Exclude<FormatValue, "any">}`;
    return PAIR_TOOL_MAP[key] ?? null;
  }

  if (source !== "any" && target === "any") {
    return SOURCE_TOOL_MAP[source as Exclude<FormatValue, "any" | "docx">] ?? null;
  }

  if (target !== "any" && source === "any") {
    return TARGET_TOOL_MAP[target as Exclude<FormatValue, "any">] ?? null;
  }

  return null;
}

export function getToolsForMime(mime: string): ToolSlug[] {
  return (FORMAT_OUTPUT_MAP[mime] ?? []).filter((tool) =>
    CONVERTER_TOOLS.includes(tool),
  );
}

export function formatFromMime(mime: string): FormatValue | null {
  return MIME_TO_FORMAT[mime] ?? null;
}

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
  const tool = resolveToolFromFormats(source, target);
  const config = tool ? TOOL_CONFIG[tool] : null;

  if (source !== "any" && target !== "any" && source !== target) {
    return {
      title: `${formatLabel(source)} to ${formatLabel(target)} Converter`,
      highlight: "Free & instant.",
      description:
        config?.longDesc ??
        `Convert ${formatLabel(source)} files to ${formatLabel(target)} instantly — free, private, and unlimited.`,
    };
  }

  if (source !== "any" && target === "any") {
    return {
      title: `${formatLabel(source)} Converter`,
      highlight: "Free & instant.",
      description:
        config?.longDesc ??
        `Convert ${formatLabel(source)} files to any supported format. Free, unlimited, no signup required.`,
    };
  }

  if (target !== "any" && source === "any") {
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
