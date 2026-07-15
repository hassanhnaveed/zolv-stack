"use client";

import {
  ChevronDown,
  ChevronRight,
  FileImage,
  FileText,
  Film,
  Image as ImageIcon,
  RefreshCw,
  Search,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  getSourceFormatGroups,
  getTargetFormatGroups,
  HERO_ROTATING_PAIRS,
  getHeroCopy,
  isValidConverterSelection,
  resolveToolFromFormats,
  type ConverterPair,
  type FormatCategoryId,
  type FormatOption,
  type FormatOptionGroup,
  type FormatValue,
  type HeroCopy,
} from "@/lib/format-catalog";
import type { ToolSlug } from "@/lib/utils";

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

  if (value === "any") return <FileImage {...props} />;
  if (value === "gif") return <Film {...props} />;
  if (
    value === "pdf" ||
    value === "docx" ||
    value === "doc" ||
    value === "odt" ||
    value === "rtf" ||
    value === "txt" ||
    value === "html" ||
    value === "md"
  ) {
    return <FileText {...props} />;
  }
  if (value === "heic" || value === "jpg" || value === "png" || value === "webp")
    return <ImageIcon {...props} />;
  return <FileImage {...props} />;
}

function formatDisplayLabel(value: FormatValue): string {
  if (value === "any") return "Any";
  return value.toUpperCase();
}

function FormatPickerDropdown({
  groups,
  value,
  disabledValue,
  align = "start",
  onSelect,
  onClose,
}: {
  groups: FormatOptionGroup[];
  value: FormatValue;
  disabledValue: FormatValue;
  /** Align panel under left (source) or right (target) card */
  align?: "start" | "end";
  onSelect: (value: FormatValue) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  /** User pick only — effective category is derived (no setState-in-effect). */
  const [categoryOverride, setCategoryOverride] =
    useState<FormatCategoryId | null>(null);

  const initialCategory = useMemo<FormatCategoryId>(() => {
    if (value !== "any") {
      const match = groups.find((g) =>
        g.options.some((o) => o.value === value),
      );
      if (match) return match.id;
    }
    return groups[0]?.id ?? "image";
  }, [groups, value]);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const query = search.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!query) return groups;
    return groups
      .map((group) => ({
        ...group,
        options: group.options.filter(
          (option) =>
            option.label.toLowerCase().includes(query) ||
            option.value.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [groups, query]);

  const activeCategory = useMemo<FormatCategoryId>(() => {
    if (
      categoryOverride &&
      filteredGroups.some((g) => g.id === categoryOverride)
    ) {
      return categoryOverride;
    }
    if (filteredGroups.some((g) => g.id === initialCategory)) {
      return initialCategory;
    }
    return filteredGroups[0]?.id ?? "image";
  }, [categoryOverride, filteredGroups, initialCategory]);

  const activeGroup =
    filteredGroups.find((g) => g.id === activeCategory) ?? filteredGroups[0];

  const visibleOptions: FormatOption[] = activeGroup?.options ?? [];

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-label="Select format"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: align === "start" ? 0 : "auto",
        right: align === "end" ? 0 : "auto",
        width: "min(360px, calc(100vw - 32px))",
        zIndex: 40,
        borderRadius: 12,
        overflow: "hidden",
        background: "rgba(22, 26, 32, 0.97)",
        border: "1px solid var(--color-border-hover)",
        boxShadow:
          "0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,208,132,0.06)",
        backdropFilter: "blur(18px)",
        transformOrigin: align === "start" ? "top left" : "top right",
      }}
    >
      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 11px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <Search size={14} color="var(--color-text-3)" strokeWidth={2} />
        <input
          ref={searchRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Format"
          aria-label="Search format"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--color-text-1)",
            fontSize: 12.5,
            fontFamily: "var(--font-body)",
            fontWeight: 500,
          }}
        />
      </div>

      {/* Body: categories + grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "108px 1fr",
          minHeight: 168,
          maxHeight: 220,
        }}
      >
        <aside
          style={{
            borderRight: "1px solid var(--color-border)",
            padding: "6px 4px",
            overflowY: "auto",
            background: "rgba(17, 19, 24, 0.55)",
          }}
        >
          {filteredGroups.length === 0 ? (
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-3)",
                padding: "8px 8px",
              }}
            >
              No matches
            </p>
          ) : (
            filteredGroups.map((group) => {
              const selected = group.id === activeCategory;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setCategoryOverride(group.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                    padding: "8px 9px",
                    marginBottom: 1,
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: selected
                      ? "rgba(0, 208, 132, 0.12)"
                      : "transparent",
                    color: selected
                      ? "var(--color-brand)"
                      : "var(--color-text-2)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 12,
                    letterSpacing: "0.01em",
                    textAlign: "left",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.color = "var(--color-text-1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--color-text-2)";
                    }
                  }}
                >
                  <span>{group.label}</span>
                  {selected && (
                    <ChevronRight
                      size={12}
                      strokeWidth={2.2}
                      color="var(--color-brand)"
                    />
                  )}
                </button>
              );
            })
          )}
        </aside>

        <div
          style={{
            padding: 8,
            overflowY: "auto",
            background: "var(--color-bg-2)",
          }}
        >
          {visibleOptions.length === 0 ? (
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-3)",
                padding: 8,
                textAlign: "center",
              }}
            >
              No formats in this category
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 6,
              }}
            >
              {visibleOptions.map((option) => {
                const isDisabled =
                  disabledValue !== "any" && option.value === disabledValue;
                const isActive = value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;
                      onSelect(option.value);
                      onClose();
                    }}
                    style={{
                      minHeight: 30,
                      padding: "5px 4px",
                      borderRadius: 8,
                      border: isActive
                        ? "1px solid rgba(0, 208, 132, 0.55)"
                        : "1px solid var(--color-border)",
                      background: isActive
                        ? "rgba(0, 208, 132, 0.12)"
                        : "var(--color-bg-3)",
                      color: isDisabled
                        ? "var(--color-text-3)"
                        : isActive
                          ? "var(--color-brand)"
                          : "var(--color-text-1)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.45 : 1,
                      transition: "border-color 0.15s, background 0.15s, color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (isDisabled || isActive) return;
                      e.currentTarget.style.borderColor =
                        "var(--color-border-hover)";
                      e.currentTarget.style.background = "var(--color-bg-4)";
                    }}
                    onMouseLeave={(e) => {
                      if (isDisabled || isActive) return;
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.background = "var(--color-bg-3)";
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function FormatCard({
  value,
  highlighted,
  open,
  onOpenChange,
}: {
  value: FormatValue;
  highlighted?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const cardStyle: CSSProperties = {
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
    border:
      open || highlighted
        ? "1px solid rgba(0, 208, 132, 0.55)"
        : "1px solid var(--color-border)",
    boxShadow:
      open || highlighted
        ? "0 0 30px rgba(0, 208, 132, 0.22)"
        : hovered
          ? "0 8px 24px rgba(0,0,0,0.28)"
          : "0 4px 14px rgba(0,0,0,0.18)",
    cursor: "pointer",
    userSelect: "none",
    padding: 0,
    font: "inherit",
    color: "inherit",
  };

  return (
    <motion.button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={`Select format, currently ${formatDisplayLabel(value)}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onOpenChange(!open);
      }}
      animate={{
        scale: hovered || open ? 1.03 : 1,
        y: hovered || open ? -2 : 0,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      style={cardStyle}
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
          <FormatIcon value={value} accent={highlighted || open} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: "0.04em",
              lineHeight: 1,
              color:
                highlighted || open
                  ? "var(--color-brand)"
                  : "var(--color-text-1)",
              textTransform: "uppercase",
            }}
          >
            {formatDisplayLabel(value)}
          </span>
        </motion.div>
      </AnimatePresence>

      <ChevronDown
        size={12}
        strokeWidth={2.4}
        color={
          highlighted || open
            ? "rgba(0, 208, 132, 0.85)"
            : "var(--color-text-3)"
        }
        style={{
          position: "absolute",
          right: 12,
          bottom: 10,
          pointerEvents: "none",
        }}
      />
    </motion.button>
  );
}

interface HeroConversionGraphicProps {
  onCopyChange?: (copy: HeroCopy) => void;
  onToolChange?: (tool: ToolSlug | null) => void;
}

export function HeroConversionGraphic({
  onCopyChange,
  onToolChange,
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
  const [openSide, setOpenSide] = useState<"source" | "target" | null>(null);
  const pairIndexRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const pickerOpen = openSide !== null;
  const shouldAutoRotate = !autoRotateStopped && !isHovered && !pickerOpen;

  const sourceGroups = getSourceFormatGroups();
  const targetGroups = getTargetFormatGroups(source);
  const targetValues = useMemo(
    () => targetGroups.flatMap((group) => group.options.map((o) => o.value)),
    [targetGroups],
  );

  const activeTarget: FormatValue =
    target === "any" ||
    targetValues.includes(target as Exclude<FormatValue, "any">)
      ? target
      : "any";

  useEffect(() => {
    onCopyChange?.(getHeroCopy(source, activeTarget));
  }, [source, activeTarget, onCopyChange]);

  useEffect(() => {
    onToolChange?.(
      isValidConverterSelection(source, activeTarget)
        ? resolveToolFromFormats(source, activeTarget)
        : null,
    );
  }, [source, activeTarget, onToolChange]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenSide(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenSide(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [pickerOpen]);

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
    () => isValidConverterSelection(source, activeTarget),
    [source, activeTarget],
  );

  const stopAutoRotate = () => {
    setAutoRotateStopped(true);
  };

  const handleSourceChange = (value: FormatValue) => {
    if (value === "any") return;
    stopAutoRotate();
    setSwapSpin((n) => n + 180);

    if (source !== "any" && activeTarget !== "any") {
      setSource(value);
      setTarget("any");
      return;
    }

    if (source === "any" && activeTarget !== "any") {
      setSource(value === activeTarget ? "any" : value);
      return;
    }

    setSource(value);
    setTarget("any");
  };

  const handleTargetChange = (value: FormatValue) => {
    if (value === "any") return;
    stopAutoRotate();
    setSwapSpin((n) => n + 180);

    if (source !== "any" && activeTarget !== "any") {
      setTarget(value);
      setSource("any");
      return;
    }

    if (activeTarget === "any" && source !== "any") {
      setTarget(value === source ? "any" : value);
      return;
    }

    setTarget(value);
    setSource("any");
  };

  const swapFormats = () => {
    stopAutoRotate();
    setOpenSide(null);
    setSwapSpin((n) => n + 180);
    setSource(activeTarget);
    setTarget(source);
  };

  const closePicker = () => setOpenSide(null);

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 380,
        minHeight: 170,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        overflow: "visible",
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
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: "relative",
            width: CARD_SIZE,
            flexShrink: 0,
          }}
        >
          <FormatCard
            value={source}
            open={openSide === "source"}
            onOpenChange={(next) => {
              stopAutoRotate();
              setOpenSide(next ? "source" : null);
            }}
          />
          <AnimatePresence>
            {openSide === "source" && (
              <FormatPickerDropdown
                key="source-picker"
                groups={sourceGroups}
                value={source}
                disabledValue={activeTarget}
                align="start"
                onSelect={handleSourceChange}
                onClose={closePicker}
              />
            )}
          </AnimatePresence>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            zIndex: 1,
            flexShrink: 0,
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

        <div
          style={{
            position: "relative",
            width: CARD_SIZE,
            flexShrink: 0,
          }}
        >
          <FormatCard
            value={activeTarget}
            highlighted
            open={openSide === "target"}
            onOpenChange={(next) => {
              stopAutoRotate();
              setOpenSide(next ? "target" : null);
            }}
          />
          <AnimatePresence>
            {openSide === "target" && (
              <FormatPickerDropdown
                key="target-picker"
                groups={targetGroups}
                value={activeTarget}
                disabledValue={source}
                align="start"
                onSelect={handleTargetChange}
                onClose={closePicker}
              />
            )}
          </AnimatePresence>
        </div>
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
          ? `${source} to ${activeTarget} ready`
          : "Choose different source and target formats"}
      </span>
    </div>
  );
}
