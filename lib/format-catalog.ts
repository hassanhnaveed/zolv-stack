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
  | "docx"
  | "doc"
  | "odt"
  | "rtf"
  | "txt"
  | "html"
  | "md";

export type FormatCategoryId = "image" | "document";

export interface FormatOption {
  value: Exclude<FormatValue, "any">;
  label: string;
  category: FormatCategoryId;
}

export interface FormatOptionGroup {
  id: FormatCategoryId;
  label: "Image" | "Document";
  options: FormatOption[];
}

export interface ConverterPair {
  source: FormatValue;
  target: FormatValue;
}

const OFFICE_TO_PDF_TOOLS: ToolSlug[] = [
  "docx-to-pdf",
  "doc-to-pdf",
  "odt-to-pdf",
  "rtf-to-pdf",
  "txt-to-pdf",
  "html-to-pdf",
  "md-to-pdf",
];

/** Pair-conversion tools for the hero / upload widget (no PDF utilities / AI). */
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
  "pdf-to-jpg",
  "pdf-to-word",
  ...OFFICE_TO_PDF_TOOLS,
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
  doc: "DOC",
  odt: "ODT",
  rtf: "RTF",
  txt: "TXT",
  html: "HTML",
  md: "MD",
};

const IMAGE_FORMATS = [
  "jpg",
  "png",
  "webp",
  "gif",
  "avif",
  "bmp",
  "tiff",
  "heic",
] as const;

const DOCUMENT_FORMATS = [
  "pdf",
  "docx",
  "doc",
  "odt",
  "rtf",
  "txt",
  "html",
  "md",
] as const;

const DOCUMENT_FORMAT_SET = new Set<string>(DOCUMENT_FORMATS);

function categoryForFormat(
  value: Exclude<FormatValue, "any">,
): FormatCategoryId {
  return DOCUMENT_FORMAT_SET.has(value) ? "document" : "image";
}

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
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/msword": "doc",
  "application/vnd.oasis.opendocument.text": "odt",
  "application/rtf": "rtf",
  "text/rtf": "rtf",
  "text/plain": "txt",
  "text/html": "html",
  "text/markdown": "md",
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
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  odt: "application/vnd.oasis.opendocument.text",
  rtf: "application/rtf",
  txt: "text/plain",
  html: "text/html",
  md: "text/markdown",
};

/** Input formats supported by the upload widget and conversion APIs. */
export const SOURCE_FORMATS: Exclude<FormatValue, "any">[] = [
  ...IMAGE_FORMATS,
  ...DOCUMENT_FORMATS,
];

function toFormatOption(value: Exclude<FormatValue, "any">): FormatOption {
  return {
    value,
    label: FORMAT_LABELS[value],
    category: categoryForFormat(value),
  };
}

// old code
// function groupOptions(options: FormatOption[]): FormatOptionGroup[] {
//   const image = options.filter((o) => o.category === "image");
//   const document = options.filter((o) => o.category === "document");
//   const groups: FormatOptionGroup[] = [];
//   if (image.length > 0) {
//     groups.push({ id: "image", label: "Image", options: image });
//   }
//   if (document.length > 0) {
//     groups.push({ id: "document", label: "Document", options: document });
//   }
//   return groups;
// }

//new code 
function groupOptions(options: FormatOption[]): FormatOptionGroup[] {
  const image = options.filter((o) => o.category === "image");
  const groups: FormatOptionGroup[] = [];
  if (image.length > 0) {
    groups.push({ id: "image", label: "Image", options: image });
  }
  return groups;
}

/** Selectable source formats only — Image + Document. No "Any". */
export function getSourceFormatGroups(): FormatOptionGroup[] {
  return groupOptions(SOURCE_FORMATS.map((value) => toFormatOption(value)));
}

/** Flat selectable source formats (no "Any", no PDF Tools / AI). */
export function getSourceFormatOptions(): FormatOption[] {
  return getSourceFormatGroups().flatMap((group) => group.options);
}

function toolToTargetFormat(tool: ToolSlug): Exclude<FormatValue, "any"> | null {
  if (!CONVERTER_TOOLS.includes(tool)) return null;
  if (tool === "pdf-to-word") return "docx";
  if (tool === "image-to-pdf" || OFFICE_TO_PDF_TOOLS.includes(tool)) return "pdf";

  const ext = TOOL_CONFIG[tool].outputExt.replace(".", "").toLowerCase();
  if (ext === "jpeg") return "jpg";
  if (ext === "tiff") return "tiff";
  if (ext in FORMAT_LABELS) return ext as Exclude<FormatValue, "any">;
  return null;
}

function collectTargetFormats(
  source: FormatValue,
): Exclude<FormatValue, "any">[] {
  const targets = new Set<Exclude<FormatValue, "any">>();

  if (source === "any") {
    for (const mime of Object.keys(FORMAT_OUTPUT_MAP)) {
      for (const tool of FORMAT_OUTPUT_MAP[mime] ?? []) {
        const target = toolToTargetFormat(tool);
        if (target) targets.add(target);
      }
    }
    return Array.from(targets);
  }

  const mime = FORMAT_TO_MIME[source];
  if (!mime) return [];

  for (const tool of FORMAT_OUTPUT_MAP[mime] ?? []) {
    const target = toolToTargetFormat(tool);
    if (target && target !== source) targets.add(target);
  }

  return Array.from(targets);
}

/** Selectable target formats only — Image + Document. No "Any". */
export function getTargetFormatGroups(
  source: FormatValue,
): FormatOptionGroup[] {
  return groupOptions(
    collectTargetFormats(source).map((value) => toFormatOption(value)),
  );
}

export function getTargetFormatOptions(source: FormatValue): FormatOption[] {
  return getTargetFormatGroups(source).flatMap((group) => group.options);
}

/** @deprecated Prefer getSourceFormatGroups — excludes placeholder "Any". */
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
  if (source === "any" || target === "any" || source === target) return false;
  return resolveToolFromFormats(source, target) !== null;
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
  "docx-pdf": "docx-to-pdf",
  "doc-pdf": "doc-to-pdf",
  "odt-pdf": "odt-to-pdf",
  "rtf-pdf": "rtf-to-pdf",
  "txt-pdf": "txt-to-pdf",
  "html-pdf": "html-to-pdf",
  "md-pdf": "md-to-pdf",
};

/** Resolves a concrete conversion tool only when both sides are real formats. */
export function resolveToolFromFormats(
  source: FormatValue,
  target: FormatValue,
): ToolSlug | null {
  if (source === "any" || target === "any" || source === target) return null;

  const key =
    `${source}-${target}` as `${Exclude<FormatValue, "any">}-${Exclude<FormatValue, "any">}`;
  return PAIR_TOOL_MAP[key] ?? null;
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
