// new code
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings2,
  FileDown,
  ZapIcon,
} from "lucide-react";
import {
  formatBytes,
  getErrorMessage,
  getSavingsPct,
  type ToolSlug,
  TOOL_CONFIG,
  FORMAT_OUTPUT_MAP,
} from "@/lib/utils";
import { toast } from "sonner";
import { DropzoneIdleContent } from "./DropzoneIdleContent";

interface FileItem {
  id: string;
  file: File;
  status: "idle" | "converting" | "done" | "error";
  preview?: string;
  outputUrl?: string;
  outputSize?: number;
  outputExt?: string;
  error?: string;
}

interface ConverterProps {
  tool: ToolSlug;
  onToolChange?: (tool: ToolSlug) => void;
}

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
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    [".docx"],
  "application/msword": [".doc"],
  "application/vnd.oasis.opendocument.text": [".odt"],
  "application/rtf": [".rtf"],
  "text/rtf": [".rtf"],
  "text/plain": [".txt"],
  "text/html": [".html", ".htm"],
  "text/markdown": [".md"],
};

export function Converter({ tool: initialTool, onToolChange }: ConverterProps) {
  const [selectedTool, setSelectedTool] = useState<ToolSlug>(initialTool);
  const [availableTools, setAvailableTools] = useState<ToolSlug[]>([
    initialTool,
  ]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [quality, setQuality] = useState(85);
  const [showSettings, setShowSettings] = useState(false);
  const [fileDetected, setFileDetected] = useState(false);

  const config = TOOL_CONFIG[selectedTool];
  const showQuality = [
    "image-to-webp",
    "webp-to-jpg",
    "webp-to-png",
    "heic-to-jpg",
  ].includes(selectedTool);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length === 0) return;
      const firstFile = accepted[0];
      const mime = firstFile.type;
      const validTools = FORMAT_OUTPUT_MAP[mime] || [initialTool];
      setAvailableTools(validTools);
      setSelectedTool(validTools[0]);
      onToolChange?.(validTools[0]);
      setFileDetected(true);
      const newItems: FileItem[] = accepted.slice(0, 20).map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        status: "idle",
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      }));
      setFiles((prev) => [...prev, ...newItems]);
    },
    [initialTool, onToolChange],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ALL_ACCEPT,
    maxSize: 200 * 1024 * 1024, // ✅ 200MB
    maxFiles: 20,
    noClick: true,
    onDropRejected: () =>
      toast.error("File rejected — check format or size (max 200MB)"),
  });

  const convertFile = async (item: FileItem) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: "converting" } : f)),
    );
    try {
      const fd = new FormData();
      fd.append("file", item.file);
      fd.append("tool", selectedTool);
      fd.append("quality", quality.toString());

      const officeToPdfTools = [
  "docx-to-pdf",
  "doc-to-pdf",
  "odt-to-pdf",
  "rtf-to-pdf",
  "txt-to-pdf",
  "html-to-pdf",
  "md-to-pdf",
];

const endpoint = officeToPdfTools.includes(selectedTool)
  ? "/api/docx-to-pdf"
  : selectedTool === "pdf-to-txt"
  ? "/api/pdf-to-txt"
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
      const url = URL.createObjectURL(blob);
      let outputExt: string | undefined;
      if (selectedTool === "pdf-to-jpg") {
        outputExt = blob.type.includes("zip") ? "-pages.zip" : ".jpg";
      }
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: "done",
                outputUrl: url,
                outputSize: blob.size,
                outputExt,
              }
            : f,
        ),
      );
      toast.success(`Converted: ${item.file.name}`);
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Conversion failed");
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: "error", error: message } : f,
        ),
      );
      toast.error(message);
    }
  };

  // ✅ Image to PDF — sab images ek PDF mein
  const convertImagesToPdf = async () => {
    const idleFiles = files.filter((f) => f.status === "idle");
    if (idleFiles.length === 0) return;

    setFiles((prev) =>
      prev.map((f) =>
        f.status === "idle" ? { ...f, status: "converting" } : f,
      ),
    );

    try {
      const fd = new FormData();
      for (const item of idleFiles) {
        fd.append("file", item.file);
      }
      fd.append("tool", "image-to-pdf");

      const res = await fetch("/api/pdf", { method: "POST", body: fd });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error || "Conversion failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Pehli idle file pe URL rakho, baaki done mark karo
      let first = true;
      setFiles((prev) =>
        prev.map((f) => {
          const isIdle = idleFiles.find((idle) => idle.id === f.id);
          if (!isIdle) return f;
          if (first) {
            first = false;
            return {
              ...f,
              status: "done",
              outputUrl: url,
              outputSize: blob.size,
            };
          }
          return { ...f, status: "done" };
        }),
      );

      toast.success("All images combined into one PDF!");
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Conversion failed");
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "converting"
            ? { ...f, status: "error", error: message }
            : f,
        ),
      );
      toast.error(message);
    }
  };

  // ✅ Convert All — image-to-pdf ke liye special handling
  const convertAll = () => {
    if (selectedTool === "image-to-pdf") {
      convertImagesToPdf();
    } else {
      files.filter((f) => f.status === "idle").forEach(convertFile);
    }
  };

  const downloadFile = (item: FileItem) => {
    if (!item.outputUrl) return;
    const a = document.createElement("a");
    a.href = item.outputUrl;
    if (selectedTool === "pdf-to-jpg") {
      const ext = item.outputExt ?? ".jpg";
      a.download = item.file.name.replace(".pdf", ext);
    } else {
      a.download = item.file.name.replace(/\.[^.]+$/, config.outputExt);
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = async () => {
    const done = files.filter((f) => f.status === "done" && f.outputUrl);
    if (done.length === 0) return;
    if (done.length === 1) {
      downloadFile(done[0]);
      return;
    }
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const item of done) {
        const res = await fetch(item.outputUrl!);
        const blob = await res.blob();
        zip.file(item.file.name.replace(/\.[^.]+$/, config.outputExt), blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = `fileora-${selectedTool}.zip`;
      a.click();
    } catch {
      toast.error("Could not create ZIP");
    }
  };

  const removeFile = (id: string) => {
    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    if (remaining.length === 0) {
      setFileDetected(false);
      setAvailableTools([initialTool]);
      setSelectedTool(initialTool);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setFileDetected(false);
    setAvailableTools([initialTool]);
    setSelectedTool(initialTool);
  };

  const doneCount = files.filter((f) => f.status === "done").length;
  const idleCount = files.filter((f) => f.status === "idle").length;

  return (
    <div style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
      {/* Format selector */}
      <AnimatePresence>
        {fileDetected && availableTools.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ marginBottom: 16 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "var(--color-bg-3)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "10px 16px",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "var(--color-text-3)",
                  whiteSpace: "nowrap",
                }}
              >
                Convert to:
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {availableTools.map((t) => {
                  const tc = TOOL_CONFIG[t];
                  return (
                    <button
                      key={t}
                      onClick={() => {
                        setSelectedTool(t);
                        onToolChange?.(t);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 12px",
                        borderRadius: 7,
                        cursor: "pointer",
                        border:
                          selectedTool === t
                            ? "1px solid var(--color-brand)"
                            : "1px solid transparent",
                        background:
                          selectedTool === t
                            ? "rgba(0,208,132,0.12)"
                            : "transparent",
                        color:
                          selectedTool === t
                            ? "var(--color-brand)"
                            : "var(--color-text-2)",
                        fontSize: 13,
                        fontWeight: 600,
                        transition: "all 0.15s",
                      }}
                    >
                      <span>{tc.icon}</span>
                      {tc.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          minHeight: 36,
        }}
      >
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-3)",
            fontSize: 13,
            padding: 0,
          }}
        >
          <Settings2 size={14} /> Settings
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {doneCount > 1 && (
            <button
              onClick={downloadAll}
              className="btn-ghost"
              style={{
                fontSize: 13,
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <FileDown size={14} /> Download all ({doneCount})
            </button>
          )}
          {idleCount > 0 && (
            <button
              onClick={convertAll}
              className="btn-primary"
              style={{ fontSize: 13, padding: "6px 14px" }}
            >
              <ZapIcon size={14} /> Convert{" "}
              {idleCount > 1 ? `all (${idleCount})` : ""}
            </button>
          )}
          {files.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--color-text-3)",
              }}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && showQuality && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginBottom: 12 }}
          >
            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-2)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Quality
                </span>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "var(--color-brand)" }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--color-brand)",
                    minWidth: 36,
                  }}
                >
                  {quality}%
                </span>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-3)",
                  marginTop: 8,
                }}
              >
                85% recommended — great balance of quality and file size.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`dropzone${isDragActive ? " active" : ""}`}
        style={{ marginBottom: 16 }}
      >
        <input {...getInputProps()} />
        <DropzoneIdleContent
          isDragActive={isDragActive}
          onOpenFilePicker={open}
          dragTitle="Drop files here"
          meta={
            selectedTool === "image-to-pdf"
              ? "Up to 20 images, 200MB each · JPG, PNG, WebP, HEIC, GIF, BMP, TIFF, AVIF, PDF, DOCX"
              : "Up to 20 files, 200MB each · JPG, PNG, WebP, HEIC, GIF, BMP, TIFF, AVIF, PDF, DOCX"
          }
        >
          {selectedTool === "image-to-pdf" && (
            <p
              style={{
                fontSize: 12,
                color: "var(--color-brand)",
                marginTop: 8,
                fontWeight: 600,
              }}
            >
              All images will be combined into one PDF
            </p>
          )}
        </DropzoneIdleContent>
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {files.map((item, i) => {
              const savings = item.outputSize
                ? getSavingsPct(item.file.size, item.outputSize)
                : null;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: i * 0.02 }}
                  className="card"
                  style={{
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  {item.preview ? (
                    <img
                      src={item.preview}
                      alt=""
                      style={{
                        width: 44,
                        height: 44,
                        objectFit: "cover",
                        borderRadius: 8,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        background: "var(--color-bg-4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: 20,
                      }}
                    >
                      {config.icon}
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "var(--color-text-1)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.file.name}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 3,
                      }}
                    >
                      <span
                        style={{ fontSize: 12, color: "var(--color-text-3)" }}
                      >
                        {formatBytes(item.file.size)}
                      </span>
                      {item.outputSize && (
                        <>
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-3)",
                            }}
                          >
                            →
                          </span>
                          <span style={{ fontSize: 12, color: "#34D399" }}>
                            {formatBytes(item.outputSize)}
                          </span>
                          {savings && Number(savings) > 0 && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#34D399",
                                background: "rgba(52,211,153,0.12)",
                                padding: "2px 7px",
                                borderRadius: 99,
                              }}
                            >
                              -{savings}%
                            </span>
                          )}
                        </>
                      )}
                      {item.error && (
                        <span style={{ fontSize: 12, color: "#F87171" }}>
                          {item.error}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    {item.status === "idle" && (
                      <button
                        onClick={() =>
                          selectedTool === "image-to-pdf"
                            ? convertImagesToPdf()
                            : convertFile(item)
                        }
                        className="btn-primary"
                        style={{ fontSize: 12, padding: "6px 14px" }}
                      >
                        {selectedTool === "image-to-pdf"
                          ? "Combine to PDF"
                          : "Convert"}
                      </button>
                    )}
                    {item.status === "converting" && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          color: "var(--color-text-3)",
                        }}
                      >
                        <Loader2
                          size={14}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                        Converting…
                      </div>
                    )}
                    {item.status === "done" && (
                      <>
                        <CheckCircle size={16} color="#34D399" />
                        {item.outputUrl && (
                          <button
                            onClick={() => downloadFile(item)}
                            className="btn-ghost"
                            style={{
                              fontSize: 12,
                              padding: "6px 12px",
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <Download size={13} /> Download
                          </button>
                        )}
                      </>
                    )}
                    {item.status === "error" && (
                      <>
                        <AlertCircle size={16} color="#F87171" />
                        <button
                          onClick={() => convertFile(item)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 12,
                            color: "#F87171",
                          }}
                        >
                          Retry
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => removeFile(item.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-text-3)",
                        padding: 4,
                        display: "flex",
                      }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
