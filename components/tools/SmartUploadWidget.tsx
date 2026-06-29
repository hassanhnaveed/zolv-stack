"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  X,
  Download,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  formatBytes,
  FORMAT_OUTPUT_MAP,
  TOOL_CONFIG,
  type ToolSlug,
} from "@/lib/utils";
import { toast } from "sonner";

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
};

type Phase = "idle" | "selected" | "converting" | "done" | "error";

interface SelectedFile {
  file: File;
  preview?: string;
  availableTools: ToolSlug[];
  selectedTool: ToolSlug;
}

export function SmartUploadWidget() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [selected, setSelected] = useState<SelectedFile | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length === 0) return;
    const file = accepted[0];
    const mime = file.type;
    const availableTools = FORMAT_OUTPUT_MAP[mime] ?? [];

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
      selectedTool: availableTools[0],
    });
    setPhase("selected");
    setOutputUrl(null);
    setOutputSize(null);
    setErrorMsg("");
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ALL_ACCEPT,
    maxSize: 200 * 1024 * 1024,
    maxFiles: 1,
    noClick: true,
    onDropRejected: () =>
      toast.error("File rejected — check format or size (max 200MB)"),
  });

  const selectTool = (tool: ToolSlug) => {
    if (!selected) return;
    setSelected({ ...selected, selectedTool: tool });
  };

  const convert = async () => {
    if (!selected) return;
    const { file, selectedTool } = selected;

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
    } catch (err: any) {
      setErrorMsg(err.message || "Conversion failed");
      setPhase("error");
      toast.error(err.message || "Conversion failed");
    }
  };

  const download = () => {
    if (!outputUrl || !selected) return;
    const config = TOOL_CONFIG[selected.selectedTool];
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = selected.file.name.replace(/\.[^.]+$/, config.outputExt);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setPhase("idle");
    setSelected(null);
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

      {/* Drag-over overlay */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: -2,
              background: "rgba(0,208,132,0.06)",
              border: "2px dashed var(--color-brand)",
              borderRadius: 20,
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
        {/* ── IDLE: Select File button ── */}
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ textAlign: "center" }}
          >
            <button
              onClick={open}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "var(--color-brand)",
                color: "#052210",
                fontWeight: 800,
                fontSize: 16,
                padding: "15px 40px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.3px",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 28px rgba(0,208,132,0.28)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 14px 40px rgba(0,208,132,0.38)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 4px 28px rgba(0,208,132,0.28)";
              }}
            >
              <FolderOpen size={20} />
              Select File
            </button>

            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-3)",
                marginTop: 14,
              }}
            >
              or drag &amp; drop any image or PDF here
            </p>
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-3)",
                marginTop: 6,
                opacity: 0.6,
                letterSpacing: "0.3px",
              }}
            >
              JPG · PNG · WebP · HEIC · GIF · BMP · TIFF · AVIF · PDF — up to
              200 MB
            </p>
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
                    {TOOL_CONFIG[selected.selectedTool].icon}
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
                    const isActive = selected.selectedTool === t;
                    return (
                      <button
                        key={t}
                        onClick={() => selectTool(t)}
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
                  onClick={convert}
                  disabled={phase === "converting"}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    background:
                      phase === "converting"
                        ? "rgba(0,208,132,0.5)"
                        : "var(--color-brand)",
                    color: "#052210",
                    fontWeight: 800,
                    fontSize: 15,
                    padding: "13px 28px",
                    borderRadius: 12,
                    border: "none",
                    cursor:
                      phase === "converting" ? "not-allowed" : "pointer",
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
                  {TOOL_CONFIG[selected.selectedTool].title}
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
