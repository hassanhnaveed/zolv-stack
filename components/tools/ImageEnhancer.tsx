// "use client";

// import { useCallback, useRef, useState } from "react";
// import { useDropzone } from "react-dropzone";
// import { motion, AnimatePresence } from "framer-motion";
// import { Download, Loader2, Sparkles } from "lucide-react";
// import { formatBytes } from "@/lib/utils";
// import { toast } from "sonner";

// export function ImageEnhancer() {
//   const [original, setOriginal] = useState<string | null>(null);
//   const [enhanced, setEnhanced] = useState<string | null>(null);
//   const [originalFile, setOriginalFile] = useState<File | null>(null);
//   const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingMsg, setLoadingMsg] = useState("");
//   const [sliderPos, setSliderPos] = useState(50);
//   const [isDragging, setIsDragging] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const onDrop = useCallback((accepted: File[]) => {
//     const file = accepted[0];
//     if (!file) return;
//     setOriginalFile(file);
//     setOriginal(URL.createObjectURL(file));
//     setEnhanced(null);
//     setEnhancedUrl(null);
//     setSliderPos(50);
//   }, []);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: {
//       "image/jpeg": [".jpg", ".jpeg"],
//       "image/png": [".png"],
//       "image/webp": [".webp"],
//       "image/bmp": [".bmp"],
//     },
//     maxFiles: 1,
//     maxSize: 10 * 1024 * 1024,
//     onDropRejected: () => toast.error("Max 10MB, images only"),
//   });

//   const enhance = async () => {
//     if (!originalFile || !original) return;
//     setLoading(true);

//     try {
//       setLoadingMsg("Uploading image...");

//       const formData = new FormData();
//       formData.append("image", originalFile);

//       const res = await fetch("/api/enhance", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();

//       if (!res.ok || !data.enhancedUrl) {
//         throw new Error(data.error || "Enhancement failed");
//       }

//       setLoadingMsg("Finalizing...");

//       await new Promise<void>((resolve, reject) => {
//         const img = new Image();
//         img.crossOrigin = "anonymous";
//         img.onload = () => resolve();
//         img.onerror = () => reject(new Error("Enhanced image load failed"));
//         img.src = data.enhancedUrl;
//       });

//       setEnhanced(data.enhancedUrl);
//       setEnhancedUrl(data.enhancedUrl);
//       setSliderPos(50);
//       toast.success("Image enhanced! 🎉");
//     } catch (err: any) {
//       console.error("Enhance error:", err);
//       toast.error("Enhancement failed. Please try again.");
//     } finally {
//       setLoading(false);
//       setLoadingMsg("");
//     }
//   };

//   const download = async () => {
//     if (!enhancedUrl || !originalFile) return;
//     try {
//       const res = await fetch(enhancedUrl);
//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `enhanced-${originalFile.name.replace(/\.[^.]+$/, ".png")}`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     } catch {
//       const a = document.createElement("a");
//       a.href = enhancedUrl;
//       a.target = "_blank";
//       a.download = `enhanced-${originalFile.name.replace(/\.[^.]+$/, ".png")}`;
//       a.click();
//     }
//   };

//   const handleMove = (clientX: number) => {
//     if (!containerRef.current || !isDragging) return;
//     const rect = containerRef.current.getBoundingClientRect();
//     const pos = ((clientX - rect.left) / rect.width) * 100;
//     setSliderPos(Math.min(Math.max(pos, 0), 100));
//   };

//   return (
//     <div style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
//       {!original && (
//         <div
//           {...getRootProps()}
//           className={`dropzone${isDragActive ? " active" : ""}`}
//           style={{
//             padding: "56px 32px",
//             textAlign: "center",
//             marginBottom: 16,
//           }}
//         >
//           <input {...getInputProps()} />
//           <motion.div animate={isDragActive ? { scale: 1.04 } : { scale: 1 }}>
//             <div
//               style={{
//                 width: 56,
//                 height: 56,
//                 borderRadius: 16,
//                 margin: "0 auto 16px",
//                 background: isDragActive
//                   ? "rgba(139,92,246,0.15)"
//                   : "rgba(139,92,246,0.08)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Sparkles
//                 size={24}
//                 color={isDragActive ? "#8B5CF6" : "var(--color-text-3)"}
//               />
//             </div>
//             <p
//               style={{
//                 fontFamily: "var(--font-display)",
//                 fontWeight: 700,
//                 fontSize: 17,
//                 color: "var(--color-text-1)",
//                 marginBottom: 6,
//               }}
//             >
//               {isDragActive ? "Drop image here" : "Drop an image to enhance"}
//             </p>
//             <p style={{ fontSize: 13, color: "var(--color-text-3)" }}>
//               or{" "}
//               <span style={{ color: "#8B5CF6", cursor: "pointer" }}>
//                 browse files
//               </span>{" "}
//               — JPG, PNG, WebP, BMP
//             </p>
//             <p
//               style={{
//                 fontSize: 12,
//                 color: "var(--color-text-3)",
//                 marginTop: 8,
//               }}
//             >
//               Max 10MB · AI powered · 100% free
//             </p>
//           </motion.div>
//         </div>
//       )}

//       <AnimatePresence>
//         {original && (
//           <motion.div
//             initial={{ opacity: 0, y: 16 }}
//             animate={{ opacity: 1, y: 0 }}
//             style={{ marginBottom: 16 }}
//           >
//             <div
//               ref={containerRef}
//               onMouseMove={(e) => handleMove(e.clientX)}
//               onMouseUp={() => setIsDragging(false)}
//               onMouseLeave={() => setIsDragging(false)}
//               onTouchMove={(e) => handleMove(e.touches[0].clientX)}
//               onTouchEnd={() => setIsDragging(false)}
//               style={{
//                 position: "relative",
//                 borderRadius: 16,
//                 overflow: "hidden",
//                 cursor: enhanced ? "col-resize" : "default",
//                 userSelect: "none",
//                 background: "var(--color-bg-3)",
//                 border: "1px solid var(--color-border)",
//               }}
//             >
//               {/* Original - left side background */}
//               <img
//                 src={original}
//                 alt="Original"
//                 style={{
//                   width: "100%",
//                   display: "block",
//                   maxHeight: 500,
//                   objectFit: "contain",
//                 }}
//               />

//               {enhanced && (
//                 <>
//                   {/* Enhanced - right side, slider se control */}
//                   <div
//                     style={{
//                       position: "absolute",
//                       top: 0,
//                       left: 0,
//                       right: 0,
//                       bottom: 0,
//                       clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
//                     }}
//                   >
//                     <img
//                       src={enhanced}
//                       alt="Enhanced"
//                       crossOrigin="anonymous"
//                       style={{
//                         width: "100%",
//                         height: "100%",
//                         objectFit: "contain",
//                         display: "block",
//                       }}
//                     />
//                   </div>

//                   {/* Slider handle */}
//                   <div
//                     onMouseDown={() => setIsDragging(true)}
//                     onTouchStart={() => setIsDragging(true)}
//                     style={{
//                       position: "absolute",
//                       top: 0,
//                       bottom: 0,
//                       left: `${sliderPos}%`,
//                       transform: "translateX(-50%)",
//                       width: 3,
//                       background: "#fff",
//                       cursor: "col-resize",
//                       boxShadow: "0 0 8px rgba(0,0,0,0.5)",
//                     }}
//                   >
//                     <div
//                       style={{
//                         position: "absolute",
//                         top: "50%",
//                         left: "50%",
//                         transform: "translate(-50%, -50%)",
//                         width: 36,
//                         height: 36,
//                         borderRadius: "50%",
//                         background: "#fff",
//                         boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         fontSize: 14,
//                         fontWeight: 700,
//                         color: "#333",
//                       }}
//                     >
//                       ↔
//                     </div>
//                   </div>

//                   {/* ORIGINAL label - LEFT */}
//                   <div
//                     style={{
//                       position: "absolute",
//                       top: 12,
//                       left: 12,
//                       pointerEvents: "none",
//                     }}
//                   >
//                     <span
//                       style={{
//                         background: "rgba(0,0,0,0.7)",
//                         color: "#fff",
//                         fontSize: 11,
//                         fontWeight: 700,
//                         padding: "3px 8px",
//                         borderRadius: 6,
//                       }}
//                     >
//                       ORIGINAL
//                     </span>
//                   </div>

//                   {/* ENHANCED label - RIGHT */}
//                   <div
//                     style={{
//                       position: "absolute",
//                       top: 12,
//                       right: 12,
//                       pointerEvents: "none",
//                     }}
//                   >
//                     <span
//                       style={{
//                         background: "rgba(139,92,246,0.9)",
//                         color: "#fff",
//                         fontSize: 11,
//                         fontWeight: 700,
//                         padding: "3px 8px",
//                         borderRadius: 6,
//                       }}
//                     >
//                       ENHANCED ✨
//                     </span>
//                   </div>
//                 </>
//               )}

//               {loading && (
//                 <div
//                   style={{
//                     position: "absolute",
//                     inset: 0,
//                     background: "rgba(0,0,0,0.75)",
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     gap: 16,
//                   }}
//                 >
//                   <Loader2
//                     size={40}
//                     color="#8B5CF6"
//                     style={{ animation: "spin 1s linear infinite" }}
//                   />
//                   <div style={{ textAlign: "center" }}>
//                     <p
//                       style={{
//                         color: "#fff",
//                         fontSize: 15,
//                         fontWeight: 700,
//                         marginBottom: 4,
//                       }}
//                     >
//                       AI Enhancing...
//                     </p>
//                     <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
//                       {loadingMsg}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 marginTop: 12,
//                 flexWrap: "wrap",
//                 gap: 8,
//               }}
//             >
//               <p style={{ fontSize: 13, color: "var(--color-text-3)" }}>
//                 {originalFile?.name} · {formatBytes(originalFile?.size || 0)}
//               </p>
//               <div style={{ display: "flex", gap: 8 }}>
//                 <button
//                   onClick={() => {
//                     setOriginal(null);
//                     setEnhanced(null);
//                     setOriginalFile(null);
//                     setEnhancedUrl(null);
//                   }}
//                   className="btn-ghost"
//                   style={{ fontSize: 13, padding: "6px 14px" }}
//                 >
//                   Change image
//                 </button>
//                 {enhanced && (
//                   <button
//                     onClick={download}
//                     className="btn-ghost"
//                     style={{
//                       fontSize: 13,
//                       padding: "6px 14px",
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 6,
//                     }}
//                   >
//                     <Download size={14} /> Download
//                   </button>
//                 )}
//                 <button
//                   onClick={enhance}
//                   disabled={loading}
//                   className="btn-primary"
//                   style={{
//                     fontSize: 13,
//                     padding: "6px 18px",
//                     background: loading
//                       ? "#555"
//                       : "linear-gradient(135deg, #8B5CF6, #6366F1)",
//                     cursor: loading ? "not-allowed" : "pointer",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 6,
//                   }}
//                 >
//                   {loading ? (
//                     <Loader2
//                       size={14}
//                       style={{ animation: "spin 1s linear infinite" }}
//                     />
//                   ) : (
//                     <Sparkles size={14} />
//                   )}
//                   {enhanced ? "Re-enhance" : "Enhance Image"}
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//     </div>
//   );
// }

// python wala ehnacned

"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, Loader2, Sparkles } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { toast } from "sonner";

export function ImageEnhancer() {
  const [original, setOriginal] = useState<string | null>(null);
  const [enhanced, setEnhanced] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [enhancedBlob, setEnhancedBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setOriginalFile(file);
    setOriginal(URL.createObjectURL(file));
    setEnhanced(null);
    setEnhancedBlob(null);
    setSliderPos(50);
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

  const enhance = async () => {
    if (!originalFile) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", originalFile);

      const res = await fetch("/api/enhance", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error || "Enhancement failed");
      }

      const blob = await res.blob();
      setEnhancedBlob(blob);
      setEnhanced(URL.createObjectURL(blob));
      setSliderPos(50);
      toast.success("Image enhanced!");
    } catch (err: any) {
      toast.error(err.message || "Enhancement failed");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!enhancedBlob || !originalFile) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(enhancedBlob);
    a.download = `enhanced-${originalFile.name.replace(/\.[^.]+$/, ".png")}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleMove = (clientX: number) => {
    if (!containerRef.current || !isDragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(pos, 0), 100));
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
                  ? "rgba(139,92,246,0.15)"
                  : "rgba(139,92,246,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles
                size={24}
                color={isDragActive ? "#8B5CF6" : "var(--color-text-3)"}
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
              {isDragActive ? "Drop image here" : "Drop an image to enhance"}
            </p>
            <p style={{ fontSize: 13, color: "var(--color-text-3)" }}>
              or{" "}
              <span style={{ color: "#8B5CF6", cursor: "pointer" }}>
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
              ref={containerRef}
              onMouseMove={(e) => handleMove(e.clientX)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchMove={(e) => handleMove(e.touches[0].clientX)}
              onTouchEnd={() => setIsDragging(false)}
              style={{
                position: "relative",
                borderRadius: 16,
                overflow: "hidden",
                cursor: enhanced ? "col-resize" : "default",
                userSelect: "none",
                background: "var(--color-bg-3)",
                border: "1px solid var(--color-border)",
              }}
            >
              <img
                src={original}
                alt="Original"
                style={{
                  width: "100%",
                  display: "block",
                  maxHeight: 500,
                  objectFit: "contain",
                }}
              />

              {enhanced && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                    }}
                  >
                    <img
                      src={enhanced}
                      alt="Enhanced"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </div>

                  <div
                    onMouseDown={() => setIsDragging(true)}
                    onTouchStart={() => setIsDragging(true)}
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: `${sliderPos}%`,
                      transform: "translateX(-50%)",
                      width: 3,
                      background: "#fff",
                      cursor: "col-resize",
                      boxShadow: "0 0 8px rgba(0,0,0,0.5)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "#fff",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#333",
                      }}
                    >
                      ↔
                    </div>
                  </div>

                  <div style={{ position: "absolute", top: 12, left: 12 }}>
                    <span
                      style={{
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 6,
                      }}
                    >
                      ORIGINAL
                    </span>
                  </div>
                  <div style={{ position: "absolute", top: 12, right: 12 }}>
                    <span
                      style={{
                        background: "rgba(139,92,246,0.8)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 6,
                      }}
                    >
                      ENHANCED ✨
                    </span>
                  </div>
                </>
              )}

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
                    gap: 16,
                  }}
                >
                  <Loader2
                    size={40}
                    color="#8B5CF6"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <div style={{ textAlign: "center" }}>
                    <p
                      style={{
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      AI Enhancing...
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                      This may take 10-30 seconds
                    </p>
                  </div>
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
                    setEnhanced(null);
                    setOriginalFile(null);
                    setEnhancedBlob(null);
                  }}
                  className="btn-ghost"
                  style={{ fontSize: 13, padding: "6px 14px" }}
                >
                  Change image
                </button>
                {enhanced && (
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
                    <Download size={14} /> Download
                  </button>
                )}
                <button
                  onClick={enhance}
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    fontSize: 13,
                    padding: "6px 18px",
                    background: loading
                      ? "#555"
                      : "linear-gradient(135deg, #8B5CF6, #6366F1)",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? (
                    <Loader2
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  {enhanced ? "Re-enhance" : "Enhance Image"}
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
