"use client";

import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { AcceptMap } from "@/lib/cloud/types";
import { SelectFileButton } from "./SelectFileButton";

interface DropzoneIdleContentProps {
  isDragActive: boolean;
  onOpenFilePicker: () => void;
  onFilesSelected: (files: File[]) => void;
  accept: AcceptMap;
  maxFiles: number;
  maxSize: number;
  dragTitle: string;
  idleTitle: ReactNode;
  subtitle?: ReactNode;
  meta: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  iconColor?: string;
  iconActiveColor?: string;
  iconBackground?: string;
  iconActiveBackground?: string;
}

export function DropzoneIdleContent({
  isDragActive,
  onOpenFilePicker,
  onFilesSelected,
  accept,
  maxFiles,
  maxSize,
  dragTitle,
  idleTitle,
  subtitle,
  meta,
  icon,
  children,
  disabled,
  iconColor,
  iconActiveColor,
  iconBackground,
  iconActiveBackground,
}: DropzoneIdleContentProps) {
  const iconStyle = {
    "--dropzone-icon-bg": iconBackground,
    "--dropzone-icon-bg-active": iconActiveBackground,
  } as CSSProperties;

  return (
    <motion.div
      className="dropzone__body"
      animate={isDragActive ? { scale: 1.04 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="dropzone__icon" style={iconStyle}>
        {icon ?? (
          <Upload
            size={24}
            color={
              isDragActive
                ? (iconActiveColor ?? "var(--color-brand)")
                : (iconColor ?? "var(--color-text-3)")
            }
          />
        )}
      </div>
      <p className="dropzone__title">
        {isDragActive ? dragTitle : idleTitle}
      </p>
      {!isDragActive && (
        <>
          {subtitle && <div className="dropzone__subtitle">{subtitle}</div>}
          <SelectFileButton
            onOpenFilePicker={onOpenFilePicker}
            onFilesSelected={onFilesSelected}
            accept={accept}
            maxFiles={maxFiles}
            maxSize={maxSize}
            disabled={disabled}
          />
          {children}
        </>
      )}
      <p className="dropzone__meta">{meta}</p>
    </motion.div>
  );
}
