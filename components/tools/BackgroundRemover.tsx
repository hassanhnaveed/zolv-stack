"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, Loader2, Wand2 } from "lucide-react";
import { formatBytes, getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

export function BackgroundRemover() {
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setOriginalFile(file);
    setOriginal(URL.createObjectURL(file));
    setResult(null);
    setResultBlob(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    maxSize: 15 * 1024 * 1024,
    onDropRejected: () => toast.error("Max 15MB, images only"),
  });

  const removeBg = async () => {
    if (!originalFile) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", originalFile);

      const res = await fetch("/api/remove-bg", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error || "Background removal failed");
      }

      const blob = await res.blob();
      setResultBlob(blob);
      setResult(URL.createObjectURL(blob));
      toast.success("Background removed!");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to remove background"));
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!resultBlob || !originalFile) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(resultBlob);
    a.download = `no-bg-${originalFile.name.replace(/\.[^.]+$/, ".png")}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
      {!original && (
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
                  ? "rgba(6,182,212,0.15)"
                  : "rgba(6,182,212,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Wand2
                size={24}
                color={isDragActive ? "#06B6D4" : "var(--color-text-3)"}
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
              {isDragActive
                ? "Drop image here"
                : "Drop an image to remove background"}
            </p>
            <p style={{ fontSize: 13, color: "var(--color-text-3)" }}>
              or{" "}
              <span style={{ color: "#06B6D4", cursor: "pointer" }}>
                browse files
              </span>{" "}
              — JPG, PNG, WebP
            </p>
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-3)",
                marginTop: 8,
              }}
            >
              Max 15MB · 100% free · Unlimited · AI-powered
            </p>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {original && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 16 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: result ? "1fr 1fr" : "1fr",
                gap: 12,
              }}
            >
              {/* Original */}
              <div
                style={{
                  position: "relative",
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "var(--color-bg-3)",
                  border: "1px solid var(--color-border)",
                  minHeight: 300,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 6,
                    zIndex: 2,
                  }}
                >
                  ORIGINAL
                </span>
                <img
                  src={original}
                  alt="Original"
                  style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: 400,
                    objectFit: "contain",
                    display: "block",
                  }}
                />

                {loading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.75)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                    }}
                  >
                    <Loader2
                      size={32}
                      color="#06B6D4"
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    <p style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
                      Removing background...
                    </p>
                  </div>
                )}
              </div>

              {/* Result */}
              {result && (
                <div
                  style={{
                    position: "relative",
                    borderRadius: 16,
                    overflow: "hidden",
                    backgroundImage: `
                    linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
                    linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
                    linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)
                  `,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                    backgroundColor: "#1a1a1a",
                    border: "1px solid var(--color-border)",
                    minHeight: 300,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "rgba(6,182,212,0.8)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 6,
                      zIndex: 2,
                    }}
                  >
                    NO BACKGROUND
                  </span>
                  <img
                    src={result}
                    alt="Result"
                    style={{
                      width: "100%",
                      height: "100%",
                      maxHeight: 400,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 12,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <p style={{ fontSize: 13, color: "var(--color-text-3)" }}>
                {originalFile?.name} · {formatBytes(originalFile?.size || 0)}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    setOriginal(null);
                    setResult(null);
                    setOriginalFile(null);
                    setResultBlob(null);
                  }}
                  className="btn-ghost"
                  style={{ fontSize: 13, padding: "6px 14px" }}
                >
                  Change image
                </button>
                {result && (
                  <button
                    onClick={download}
                    className="btn-ghost"
                    style={{
                      fontSize: 13,
                      padding: "6px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Download size={14} /> Download PNG
                  </button>
                )}
                <button
                  onClick={removeBg}
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    fontSize: 13,
                    padding: "6px 18px",
                    background: loading
                      ? "#555"
                      : "linear-gradient(135deg, #06B6D4, #0891B2)",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? (
                    <Loader2
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Wand2 size={14} />
                  )}
                  {result ? "Try again" : "Remove Background"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
