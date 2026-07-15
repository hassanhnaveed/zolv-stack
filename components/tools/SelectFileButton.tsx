"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  ChevronDown,
  Cloud,
  FilePlus2,
  Link2,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import { useCloudFilePicker } from "@/hooks/useCloudFilePicker";
import type { AcceptMap } from "@/lib/cloud/types";

type MenuAction = "computer" | "google-drive" | "coming-soon";

const MENU_ITEMS: {
  id: string;
  label: string;
  icon: typeof Monitor;
  action: MenuAction;
}[] = [
  { id: "computer", label: "From Computer", icon: Monitor, action: "computer" },
  {
    id: "google-drive",
    label: "Google Drive",
    icon: Cloud,
    action: "google-drive",
  },
  { id: "dropbox", label: "Dropbox", icon: Cloud, action: "coming-soon" },
  { id: "onedrive", label: "OneDrive", icon: Cloud, action: "coming-soon" },
  { id: "url", label: "By URL", icon: Link2, action: "coming-soon" },
];

interface SelectFileButtonProps {
  onOpenFilePicker: () => void;
  onFilesSelected: (files: File[]) => void;
  accept: AcceptMap;
  maxFiles: number;
  maxSize: number;
  disabled?: boolean;
}

export function SelectFileButton({
  onOpenFilePicker,
  onFilesSelected,
  accept,
  maxFiles,
  maxSize,
  disabled,
}: SelectFileButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { pick, isPicking } = useCloudFilePicker();
  const isDisabled = Boolean(disabled || isPicking);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleMainClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isDisabled) return;
    setMenuOpen(false);
    onOpenFilePicker();
  };

  const handleChevronClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isDisabled) return;
    setMenuOpen((open) => !open);
  };

  const handleMenuItem = async (
    event: ReactMouseEvent<HTMLButtonElement>,
    action: MenuAction,
  ) => {
    event.stopPropagation();
    setMenuOpen(false);
    if (isDisabled) return;

    if (action === "computer") {
      onOpenFilePicker();
      return;
    }

    if (action === "google-drive") {
      const files = await pick("google-drive", { accept, maxFiles, maxSize });
      if (files && files.length > 0) {
        onFilesSelected(files);
      }
      return;
    }

    toast.info("Coming soon");
  };

  return (
    <div className="dropzone__actions" ref={rootRef}>
      <div
        className={`select-file-btn${menuOpen ? " select-file-btn--open" : ""}${
          isDisabled ? " select-file-btn--disabled" : ""
        }`}
      >
        <button
          type="button"
          className="select-file-btn__main"
          onClick={handleMainClick}
          disabled={isDisabled}
        >
          <FilePlus2 size={16} strokeWidth={2.25} aria-hidden />
          {isPicking ? "Opening…" : "Select File"}
        </button>
        <button
          type="button"
          className="select-file-btn__chevron"
          onClick={handleChevronClick}
          disabled={isDisabled}
          aria-label="More upload options"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <ChevronDown
            size={16}
            aria-hidden
            className={
              menuOpen ? "select-file-btn__chevron-icon--open" : undefined
            }
          />
        </button>

        {menuOpen && (
          <div className="select-file-btn__menu" role="menu">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className="select-file-btn__menu-item"
                  onClick={(event) => handleMenuItem(event, item.action)}
                  disabled={isDisabled}
                >
                  <Icon size={14} aria-hidden />
                  <span className="select-file-btn__menu-item-label">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
