// components/tools/PdfToWord.tsx
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, Download } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { toast } from "sonner";

export function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: () => toast.error("PDF only, max 50MB"),
  });

  const convert = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/pdf-to-word", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error || "Conversion failed");
      }

      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(".pdf", ".docx");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success("Word file downloaded!");
    } catch (err: any) {
      toast.error(err.message || "Conversion failed");
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
                  ? "rgba(59,130,246,0.15)"
                  : "rgba(59,130,246,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText
                size={24}
                color={isDragActive ? "#3B82F6" : "var(--color-text-3)"}
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
              {isDragActive ? "Drop PDF here" : "Drop a PDF to convert"}
            </p>
            <p style={{ fontSize: 13, color: "var(--color-text-3)" }}>
              or{" "}
              <span style={{ color: "#3B82F6", cursor: "pointer" }}>
                browse files
              </span>{" "}
               PDF only, max 50MB
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
            {/* File info card */}
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
                  background: "rgba(59,130,246,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FileText size={20} color="#3B82F6" />
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
                  {formatBytes(file.size)}
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
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

            {/* Info box */}
            <div
              className="card"
              style={{
                padding: "14px 18px",
                marginBottom: 16,
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 10,
              }}
            >
              {/* <p style={{ fontSize: 13, color: "var(--color-text-2)" }}>
                ✅ Formatting, tables, and text will be preserved in the Word
                file. Complex layouts may vary slightly.
              </p> */}
            </div>

            {/* Action */}
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button
                onClick={convert}
                disabled={loading}
                className="btn-primary"
                style={{
                  background: loading
                    ? "#555"
                    : "linear-gradient(135deg, #3B82F6, #2563EB)",
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
                  <Download size={16} />
                )}
                {loading ? "Converting..." : "Convert to Word"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
