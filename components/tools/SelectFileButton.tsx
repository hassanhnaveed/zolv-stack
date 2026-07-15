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

type MenuAction = "computer" | "coming-soon";

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
    action: "coming-soon",
  },
  { id: "dropbox", label: "Dropbox", icon: Cloud, action: "coming-soon" },
  { id: "onedrive", label: "OneDrive", icon: Cloud, action: "coming-soon" },
  { id: "url", label: "By URL", icon: Link2, action: "coming-soon" },
];

interface SelectFileButtonProps {
  onOpenFilePicker: () => void;
  disabled?: boolean;
}

export function SelectFileButton({
  onOpenFilePicker,
  disabled,
}: SelectFileButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
    if (disabled) return;
    setMenuOpen(false);
    onOpenFilePicker();
  };

  const handleChevronClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (disabled) return;
    setMenuOpen((open) => !open);
  };

  const handleMenuItem = (
    event: ReactMouseEvent<HTMLButtonElement>,
    action: MenuAction,
  ) => {
    event.stopPropagation();
    setMenuOpen(false);
    if (action === "computer") {
      onOpenFilePicker();
      return;
    }
    toast.info("Coming soon");
  };

  return (
    <div className="dropzone__actions" ref={rootRef}>
      <div
        className={`select-file-btn${menuOpen ? " select-file-btn--open" : ""}${
          disabled ? " select-file-btn--disabled" : ""
        }`}
      >
        <button
          type="button"
          className="select-file-btn__main"
          onClick={handleMainClick}
          disabled={disabled}
        >
          <FilePlus2 size={16} strokeWidth={2.25} aria-hidden />
          Select File
        </button>
        <button
          type="button"
          className="select-file-btn__chevron"
          onClick={handleChevronClick}
          disabled={disabled}
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
