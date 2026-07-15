"use client";

import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import type { ReactNode } from "react";
import { SelectFileButton } from "./SelectFileButton";

interface DropzoneIdleContentProps {
  isDragActive: boolean;
  onOpenFilePicker: () => void;
  dragTitle: string;
  meta: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
}

export function DropzoneIdleContent({
  isDragActive,
  onOpenFilePicker,
  dragTitle,
  meta,
  icon,
  children,
}: DropzoneIdleContentProps) {
  return (
    <motion.div
      className="dropzone__body"
      animate={isDragActive ? { scale: 1.02 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="dropzone__icon">
        {icon ?? (
          <Upload
            size={24}
            color={isDragActive ? "var(--color-brand)" : "var(--color-text-2)"}
          />
        )}
      </div>
      <p className="dropzone__title">
        {isDragActive ? dragTitle : "Select your file here to get started"}
      </p>
      {!isDragActive && (
        <>
          <p className="dropzone__subtitle">or drop your file here.</p>
          {children}
          <SelectFileButton onOpenFilePicker={onOpenFilePicker} />
        </>
      )}
      <p className="dropzone__meta">{meta}</p>
    </motion.div>
  );
}
