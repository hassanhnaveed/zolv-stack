"use client";

import {
  FileImage,
  FileText,
  Film,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FORMAT_OPTIONS,
  HERO_ROTATING_PAIRS,
  getHeroCopy,
  isValidConverterSelection,
  type ConverterPair,
  type FormatValue,
  type HeroCopy,
} from "@/lib/format-catalog";

const AUTO_ROTATE_MS = 3200;
const CARD_SIZE = 118;

function FormatIcon({
  value,
  accent,
}: {
  value: FormatValue;
  accent?: boolean;
}) {
  const color = accent ? "var(--color-brand)" : "rgba(240,242,245,0.88)";
  const props = { size: 34, strokeWidth: 1.65, color };

  if (value === "mov" || value === "gif") return <Film {...props} />;
  if (value === "pdf" || value === "docx") return <FileText {...props} />;
  if (value === "heic" || value === "jpg" || value === "png" || value === "webp")
    return <ImageIcon {...props} />;
  return <FileImage {...props} />;
}

function FormatCard({
  value,
  options,
  disabledValue,
  highlighted,
  onChange,
}: {
  value: FormatValue;
  options: typeof FORMAT_OPTIONS;
  disabledValue: FormatValue;
  highlighted?: boolean;
  onChange: (value: FormatValue) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.label
      layout
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        scale: hovered ? 1.03 : 1,
        y: hovered ? -2 : 0,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      style={{
        position: "relative",
        width: CARD_SIZE,
        height: CARD_SIZE,
        borderRadius: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        background: "var(--color-bg-3)",
        border: highlighted
          ? "1px solid rgba(0, 208, 132, 0.55)"
          : "1px solid var(--color-border)",
        boxShadow: highlighted
          ? "0 0 30px rgba(0, 208, 132, 0.22)"
          : hovered
            ? "0 8px 24px rgba(0,0,0,0.28)"
            : "0 4px 14px rgba(0,0,0,0.18)",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`icon-${value}`}
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.9 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <FormatIcon value={value} accent={highlighted} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: "0.04em",
              lineHeight: 1,
              color: highlighted ? "var(--color-brand)" : "var(--color-text-1)",
              textTransform: "uppercase",
            }}
          >
            {value}
          </span>
        </motion.div>
      </AnimatePresence>

      <span
        aria-hidden
        style={{
          position: "absolute",
          right: 12,
          bottom: 10,
          fontSize: 11,
          lineHeight: 1,
          color: highlighted
            ? "rgba(0, 208, 132, 0.85)"
            : "var(--color-text-3)",
          pointerEvents: "none",
        }}
      >
        ▾
      </span>
      <select
        value={value}
        aria-label="Select format"
        onChange={(e) => onChange(e.target.value as FormatValue)}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          cursor: "pointer",
          border: "none",
          background: "transparent",
        }}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={
              option.value !== "any" &&
              disabledValue !== "any" &&
              option.value === disabledValue
            }
          >
            {option.label}
          </option>
        ))}
      </select>
    </motion.label>
  );
}

interface HeroConversionGraphicProps {
  onCopyChange?: (copy: HeroCopy) => void;
}

export function HeroConversionGraphic({
  onCopyChange,
}: HeroConversionGraphicProps) {
  const [source, setSource] = useState<FormatValue>(
    HERO_ROTATING_PAIRS[0].source,
  );
  const [target, setTarget] = useState<FormatValue>(
    HERO_ROTATING_PAIRS[0].target,
  );
  const [isHovered, setIsHovered] = useState(false);
  const [autoRotateStopped, setAutoRotateStopped] = useState(false);
  const [swapSpin, setSwapSpin] = useState(0);
  const pairIndexRef = useRef(0);

  const shouldAutoRotate = !autoRotateStopped && !isHovered;

  useEffect(() => {
    onCopyChange?.(getHeroCopy(source, target));
  }, [source, target, onCopyChange]);

  useEffect(() => {
    if (!shouldAutoRotate) return;

    const timer = window.setInterval(() => {
      pairIndexRef.current =
        (pairIndexRef.current + 1) % HERO_ROTATING_PAIRS.length;
      const nextPair: ConverterPair =
        HERO_ROTATING_PAIRS[pairIndexRef.current];
      setSource(nextPair.source);
      setTarget(nextPair.target);
      setSwapSpin((n) => n + 180);
    }, AUTO_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [shouldAutoRotate]);

  const canConvert = useMemo(
    () => isValidConverterSelection(source, target),
    [source, target],
  );

  const stopAutoRotate = () => {
    setAutoRotateStopped(true);
  };

  const handleSourceChange = (value: FormatValue) => {
    stopAutoRotate();
    setSwapSpin((n) => n + 180);

    // Completed pair → lock source, open the other as Any
    if (source !== "any" && target !== "any") {
      setSource(value);
      setTarget("any");
      return;
    }

    // Filling open source while target is locked
    if (source === "any" && target !== "any") {
      setSource(value === target ? "any" : value);
      return;
    }

    // Source-led one-sided flow (or both Any)
    setSource(value);
    setTarget("any");
  };

  const handleTargetChange = (value: FormatValue) => {
    stopAutoRotate();
    setSwapSpin((n) => n + 180);

    // Completed pair → lock target, open source as Any
    if (source !== "any" && target !== "any") {
      setTarget(value);
      setSource("any");
      return;
    }

    // Filling open target while source is locked (PNG → Any → JPG)
    if (target === "any" && source !== "any") {
      setTarget(value === source ? "any" : value);
      return;
    }

    // Target-led one-sided flow
    setTarget(value);
    setSource("any");
  };

  const swapFormats = () => {
    stopAutoRotate();
    setSwapSpin((n) => n + 180);
    setSource(target);
    setTarget(source);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 320,
        minHeight: 170,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "50% auto auto 50%",
          width: 250,
          height: 250,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.035)",
          pointerEvents: "none",
          boxShadow:
            "0 0 0 26px rgba(255,255,255,0.02), 0 0 0 52px rgba(255,255,255,0.015)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <FormatCard
          value={source}
          options={FORMAT_OPTIONS}
          disabledValue={target}
          onChange={handleSourceChange}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            zIndex: 1,
          }}
        >
          <motion.button
            type="button"
            aria-label="Swap formats"
            onClick={swapFormats}
            animate={{ rotate: swapSpin }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            style={{
              width: 36,
              height: 36,
              borderRadius: "999px",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-2)",
              color: "var(--color-text-2)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
            }}
          >
            <RefreshCw size={15} strokeWidth={2} />
          </motion.button>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              color: "var(--color-text-3)",
              textTransform: "uppercase",
            }}
          >
            TO
          </span>
        </div>

        <FormatCard
          value={target}
          options={FORMAT_OPTIONS}
          disabledValue={source}
          highlighted
          onChange={handleTargetChange}
        />
      </div>

      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
        }}
      >
        {canConvert
          ? `${source} to ${target} ready`
          : "Choose different source and target formats"}
      </span>
    </div>
  );
}
