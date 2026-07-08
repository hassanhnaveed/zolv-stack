"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, Loader2, Scissors, FileText } from "lucide-react";
import { formatBytes, getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

type Mode = "all" | "range";

export function PdfSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("all");
  const [ranges, setRanges] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setTotalPages(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: () => toast.error("PDF only, max 50MB"),
  });

  const split = async () => {
    if (!file) return;

    if (mode === "range" && !ranges.trim()) {
      toast.error("Please enter page ranges");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mode", mode);
      if (mode === "range") fd.append("ranges", ranges);

      const res = await fetch("/api/pdf-split", { method: "POST", body: fd });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error || "Split failed");
      }

      // Get total pages from header
      const pages = res.headers.get("X-Total-Pages");
      if (pages) setTotalPages(Number(pages));

      const blob = await res.blob();
      const contentType = res.headers.get("content-type") || "";
      const isZip = contentType.includes("zip");

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = isZip
        ? file.name.replace(".pdf", "-split.zip")
        : file.name.replace(".pdf", "-split.pdf");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success(isZip ? "Downloaded as ZIP!" : "PDF downloaded!");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Split failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
      {/* Drop zone */}
      {!file && (
        <div
          {...getRootProps()}
          className={`dropzone${isDragActive ? " active" : ""}`}
          style={{
            padding: "56px 32px",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          <input {...getInputProps()} />
          <motion.div animate={isDragActive ? { scale: 1.04 } : { scale: 1 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                margin: "0 auto 16px",
                background: isDragActive
                  ? "rgba(245,158,11,0.15)"
                  : "rgba(245,158,11,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Scissors
                size={24}
                color={isDragActive ? "#F59E0B" : "var(--color-text-3)"}
              />
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 17,
                color: "var(--color-text-1)",
                marginBottom: 6,
              }}
            >
              {isDragActive ? "Drop PDF here" : "Drop a PDF to split"}
            </p>
            <p style={{ fontSize: 13, color: "var(--color-text-3)" }}>
              or{" "}
              <span style={{ color: "#F59E0B", cursor: "pointer" }}>
                browse files
              </span>{" "}
              — PDF only, max 50MB
            </p>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* File info */}
            <div
              className="card"
              style={{
                padding: "16px 20px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "rgba(245,158,11,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FileText size={20} color="#F59E0B" />
              </div>
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
                  {file.name}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-3)",
                    marginTop: 2,
                  }}
                >
                  {formatBytes(file.size)}{" "}
                  {totalPages ? `· ${totalPages} pages` : ""}
                </p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setTotalPages(null);
                  setRanges("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--color-text-3)",
                }}
              >
                Change
              </button>
            </div>

            {/* Mode selector */}
            <div
              className="card"
              style={{ padding: "20px 24px", marginBottom: 16 }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-3)",
                  marginBottom: 14,
                }}
              >
                Split mode:
              </p>

              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                {[
                  {
                    value: "all",
                    label: "Extract all pages",
                    desc: "Every page becomes a separate PDF",
                  },
                  {
                    value: "range",
                    label: "Custom ranges",
                    desc: "Choose specific pages or ranges",
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMode(opt.value as Mode)}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderRadius: 10,
                      cursor: "pointer",
                      textAlign: "left",
                      border:
                        mode === opt.value
                          ? "1px solid #F59E0B"
                          : "1px solid var(--color-border)",
                      background:
                        mode === opt.value
                          ? "rgba(245,158,11,0.08)"
                          : "var(--color-bg-3)",
                      transition: "all 0.15s",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color:
                          mode === opt.value
                            ? "#F59E0B"
                            : "var(--color-text-1)",
                        marginBottom: 4,
                      }}
                    >
                      {opt.label}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--color-text-3)" }}>
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>

              {/* Range input */}
              <AnimatePresence>
                {mode === "range" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        color: "var(--color-text-2)",
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Page ranges:
                    </label>
                    <input
                      type="text"
                      value={ranges}
                      onChange={(e) => setRanges(e.target.value)}
                      placeholder="e.g. 1-3, 5, 7-10"
                      className="input-field"
                      style={{ marginBottom: 8 }}
                    />
                    <p style={{ fontSize: 12, color: "var(--color-text-3)" }}>
                      Examples:{" "}
                      <span style={{ color: "var(--color-text-2)" }}>1-5</span>{" "}
                      (pages 1 to 5) ·{" "}
                      <span style={{ color: "var(--color-text-2)" }}>
                        1, 3, 5
                      </span>{" "}
                      (individual pages) ·{" "}
                      <span style={{ color: "var(--color-text-2)" }}>
                        1-3, 7-10
                      </span>{" "}
                      (multiple ranges)
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action */}
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button
                onClick={split}
                disabled={loading}
                className="btn-primary"
                style={{
                  background: loading
                    ? "#555"
                    : "linear-gradient(135deg, #F59E0B, #D97706)",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {loading ? (
                  <Loader2
                    size={16}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Scissors size={16} />
                )}
                {loading ? "Splitting..." : "Split PDF"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
