"use client";

import { useCallback, useState, type MouseEvent } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  formatBytes,
  getErrorMessage,
  FORMAT_OUTPUT_MAP,
  TOOL_CONFIG,
  type ToolSlug,
} from "@/lib/utils";
import { CONVERTER_TOOLS } from "@/lib/format-catalog";
import { toast } from "sonner";
import { DropzoneIdleContent } from "./DropzoneIdleContent";

const ALL_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/bmp": [".bmp"],
  "image/tiff": [".tiff", ".tif"],
  "image/avif": [".avif"],
  "image/webp": [".webp"],
  "image/heic": [".heic", ".heif"],
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/msword": [".doc"],
  "application/vnd.oasis.opendocument.text": [".odt"],
  "application/rtf": [".rtf"],
  "text/rtf": [".rtf"],
  "text/plain": [".txt"],
  "text/html": [".html", ".htm"],
  "text/markdown": [".md"],
};

const OFFICE_TO_PDF_TOOLS: ToolSlug[] = [
  "docx-to-pdf",
  "doc-to-pdf",
  "odt-to-pdf",
  "rtf-to-pdf",
  "txt-to-pdf",
  "html-to-pdf",
  "md-to-pdf",
];

type Phase = "idle" | "selected" | "converting" | "done" | "error";

interface SelectedFile {
  file: File;
  preview?: string;
  availableTools: ToolSlug[];
  /**
   * Sticky Convert-to choice for this upload.
   * Set from a complete hero pair (preferredTool) on drop, or by manual pick.
   * Null while either hero side is still the Any placeholder — Convert stays disabled.
   */
  lockedTool: ToolSlug | null;
}

interface SmartUploadWidgetProps {
  preferredTool?: ToolSlug;
}

function pickInitialTool(
  availableTools: ToolSlug[],
  preferredTool: ToolSlug | undefined,
): ToolSlug | null {
  if (preferredTool && availableTools.includes(preferredTool)) {
    return preferredTool;
  }
  return null;
}

function resolveLockedTool(
  availableTools: ToolSlug[],
  lockedTool: ToolSlug | null,
): ToolSlug | null {
  if (!lockedTool) return null;
  if (availableTools.includes(lockedTool)) return lockedTool;
  return null;
}

export function SmartUploadWidget({ preferredTool }: SmartUploadWidgetProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [selected, setSelected] = useState<SelectedFile | null>(null);
  const [activeTool, setActiveTool] = useState<ToolSlug | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // After upload, Convert-to is frozen to lockedTool until reset.
  const resolvedTool = selected
    ? resolveLockedTool(selected.availableTools, selected.lockedTool)
    : null;

  // Frozen at convert start so UI / download stay consistent through converting + done.
  const displayTool = activeTool ?? resolvedTool;

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length === 0) return;
      const file = accepted[0];
      const mime = file.type;
      const availableTools = (FORMAT_OUTPUT_MAP[mime] ?? []).filter((tool) =>
        CONVERTER_TOOLS.includes(tool),
      );

      if (availableTools.length === 0) {
        toast.error("Unsupported file format");
        return;
      }

      setSelected({
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        availableTools,
        // Snapshot current showcase target once; hero rotation must not change this.
        lockedTool: pickInitialTool(availableTools, preferredTool),
      });
      setActiveTool(null);
      setPhase("selected");
      setOutputUrl(null);
      setOutputSize(null);
      setErrorMsg("");
    },
    [preferredTool],
  );

  // Click-to-open only while idle. After a file is chosen, Convert / Download /
  // format buttons live inside this root — without noClick they reopen the picker.
  const allowClickToOpen = phase === "idle";

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ALL_ACCEPT,
    maxSize: 200 * 1024 * 1024,
    maxFiles: 1,
    noClick: true,
    noKeyboard: !allowClickToOpen,
    onDropRejected: () =>
      toast.error("File rejected — check format or size (max 200MB)"),
  });

  const selectTool = (tool: ToolSlug, e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (!selected) return;
    setSelected({ ...selected, lockedTool: tool });
  };

  const convert = async (e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (!selected || !resolvedTool) return;
    const { file } = selected;
    const selectedTool = resolvedTool;

    setActiveTool(selectedTool);
    setPhase("converting");
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("tool", selectedTool);
      fd.append("quality", "85");

      const endpoint =
        selectedTool === "pdf-to-word"
          ? "/api/pdf-to-word"
          : OFFICE_TO_PDF_TOOLS.includes(selectedTool)
            ? "/api/docx-to-pdf"
            : selectedTool.startsWith("pdf") || selectedTool === "image-to-pdf"
              ? "/api/pdf"
              : "/api/convert";

      const res = await fetch(endpoint, { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: "Conversion failed" }));
        throw new Error(err.error || "Conversion failed");
      }

      const blob = await res.blob();
      setOutputUrl(URL.createObjectURL(blob));
      setOutputSize(blob.size);
      setPhase("done");
      toast.success("Conversion complete!");
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Conversion failed");
      setActiveTool(null);
      setErrorMsg(message);
      setPhase("error");
      toast.error(message);
    }
  };

  const download = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (!outputUrl || !selected || !displayTool) return;
    const config = TOOL_CONFIG[displayTool];
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = selected.file.name.replace(/\.[^.]+$/, config.outputExt);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    setPhase("idle");
    setSelected(null);
    setActiveTool(null);
    setOutputUrl(null);
    setOutputSize(null);
    setErrorMsg("");
  };

  const detectedFormat = selected?.file.type
    .split("/")[1]
    ?.toUpperCase()
    .replace("JPEG", "JPG");

  return (
    <div
      {...getRootProps()}
      style={{ width: "100%", maxWidth: 600, margin: "0 auto", position: "relative" }}
    >
      <input {...getInputProps()} />

      {/* Drag-over overlay (shown once a file is already selected, to allow drag-replace) */}
      <AnimatePresence>
        {isDragActive && phase !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: -2,
              background: "rgba(0,208,132,0.06)",
              border: "2px dashed var(--color-brand)",
              borderRadius: 16,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(2px)",
              pointerEvents: "none",
            }}
          >
            <p
              style={{
                color: "var(--color-brand)",
                fontWeight: 700,
                fontSize: 16,
                fontFamily: "var(--font-display)",
              }}
            >
              Drop to detect format
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* ── IDLE: CloudConvert-style drag & drop zone ── */}
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`dropzone${isDragActive ? " active" : ""}`}
          >
            <DropzoneIdleContent
              isDragActive={isDragActive}
              onOpenFilePicker={open}
              dragTitle="Drop to detect format"
              meta="JPG · PNG · WebP · HEIC · GIF · BMP · TIFF · AVIF · PDF — up to 200 MB"
            />
          </motion.div>
        )}

        {/* ── SELECTED / CONVERTING / ERROR: file row + format picker ── */}
        {(phase === "selected" ||
          phase === "converting" ||
          phase === "error") &&
          selected && (
            <motion.div
              key="selected"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
            >
              {/* File row */}
              <div
                style={{
                  background: "var(--color-bg-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 16,
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 12,
                }}
              >
                {selected.preview ? (
                  <img
                    src={selected.preview}
                    alt=""
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: "cover",
                      borderRadius: 10,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      background: "var(--color-bg-3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {displayTool ? TOOL_CONFIG[displayTool].icon : "📄"}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--color-text-1)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selected.file.name}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-3)",
                      marginTop: 3,
                    }}
                  >
                    {formatBytes(selected.file.size)} · Detected:{" "}
                    <span style={{ color: "var(--color-brand)", fontWeight: 600 }}>
                      {detectedFormat}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={reset}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-3)",
                    padding: 4,
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Convert to: format selector */}
              <div
                style={{
                  background: "var(--color-bg-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 16,
                  padding: "16px 18px",
                  marginBottom: 12,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--color-text-3)",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Convert to
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selected.availableTools.map((t) => {
                    const tc = TOOL_CONFIG[t];
                    const isActive = displayTool === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={(e) => selectTool(t, e)}
                        disabled={phase === "converting"}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          borderRadius: 10,
                          cursor:
                            phase === "converting" ? "not-allowed" : "pointer",
                          border: isActive
                            ? "1px solid var(--color-brand)"
                            : "1px solid var(--color-border)",
                          background: isActive
                            ? "rgba(0,208,132,0.1)"
                            : "var(--color-bg-3)",
                          color: isActive
                            ? "var(--color-brand)"
                            : "var(--color-text-2)",
                          fontSize: 13,
                          fontWeight: 600,
                          transition: "all 0.15s",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        <span style={{ fontSize: 14 }}>{tc.icon}</span>
                        {tc.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action row */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={convert}
                  disabled={phase === "converting" || !resolvedTool}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    background:
                      phase === "converting" || !resolvedTool
                        ? "rgba(0,208,132,0.5)"
                        : "var(--color-brand)",
                    color: "#052210",
                    fontWeight: 800,
                    fontSize: 15,
                    padding: "13px 28px",
                    borderRadius: 12,
                    border: "none",
                    cursor:
                      phase === "converting" || !resolvedTool
                        ? "not-allowed"
                        : "pointer",
                    fontFamily: "var(--font-display)",
                    transition: "all 0.15s",
                  }}
                >
                  {phase === "converting" ? (
                    <>
                      <Loader2
                        size={16}
                        style={{ animation: "widget-spin 1s linear infinite" }}
                      />
                      Converting…
                    </>
                  ) : (
                    "Convert"
                  )}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  disabled={phase === "converting"}
                  style={{
                    background: "var(--color-bg-2)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-2)",
                    padding: "13px 20px",
                    borderRadius: 12,
                    cursor:
                      phase === "converting" ? "not-allowed" : "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    transition: "all 0.15s",
                  }}
                >
                  Cancel
                </button>
              </div>

              {phase === "error" && (
                <p
                  style={{
                    fontSize: 13,
                    color: "#F87171",
                    marginTop: 10,
                    textAlign: "center",
                  }}
                >
                  {errorMsg}
                </p>
              )}
            </motion.div>
          )}

        {/* ── DONE: download ── */}
        {phase === "done" && selected && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              style={{
                background: "var(--color-bg-2)",
                border: "1px solid rgba(52,211,153,0.25)",
                borderRadius: 16,
                padding: "28px 20px",
                textAlign: "center",
              }}
            >
              <CheckCircle
                size={36}
                color="#34D399"
                style={{ margin: "0 auto 14px", display: "block" }}
              />
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 17,
                  color: "var(--color-text-1)",
                  marginBottom: 6,
                }}
              >
                Done!
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-3)",
                  marginBottom: 22,
                }}
              >
                {selected.file.name} →{" "}
                <span style={{ color: "var(--color-brand)", fontWeight: 600 }}>
                  {displayTool ? TOOL_CONFIG[displayTool].title : ""}
                </span>
                {outputSize ? ` · ${formatBytes(outputSize)}` : ""}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={download}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    background: "var(--color-brand)",
                    color: "#052210",
                    fontWeight: 800,
                    fontSize: 14,
                    padding: "12px 28px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    background: "var(--color-bg-3)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-2)",
                    padding: "12px 20px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Convert another file
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes widget-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
