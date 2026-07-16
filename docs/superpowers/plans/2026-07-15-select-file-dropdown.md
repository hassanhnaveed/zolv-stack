# Select File Dropdown UI Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the Select File dropdown flush under the button at exact button width with compact Option B styling and ellipsis overflow—no behavior changes.

**Architecture:** Pure CSS positioning/sizing on `.select-file-btn__menu` / `__menu-item`, plus a small label `<span>` in `SelectFileButton.tsx` so ellipsis works inside flex layout. Parent `.select-file-btn` remains `position: relative`.

**Tech Stack:** Next.js / React, existing `app/globals.css` design tokens, Lucide icons

## Global Constraints

- Dropdown width must never exceed Select File button width (`width: 100%`, no `min-width`).
- Align with `left: 0; right: 0;` — no centering transform.
- Compact Option B density only; do not change click handlers, menu items, or toast behavior.
- Single-line items with ellipsis on overflow.

---

### Task 1: Align and compact the menu CSS

**Files:**
- Modify: `app/globals.css` (`.select-file-btn__menu`, `.select-file-btn__menu-item`, and label ellipsis helper)

**Interfaces:**
- Consumes: existing `.select-file-btn` as `position: relative` containing block
- Produces: compact flush menu styles matching button width

- [x] **Step 1: Update `.select-file-btn__menu` and item styles**

Replace the current menu block so it matches:

```css
.select-file-btn__menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  width: 100%;
  background: var(--color-bg-3);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  padding: 4px;
  z-index: 50;
}
.select-file-btn__menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  padding: 7px 9px;
  border: none;
  background: transparent;
  color: var(--color-text-1);
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, color 0.15s ease;
}
.select-file-btn__menu-item:hover {
  background: var(--color-bg-4);
  color: var(--color-text-1);
}
.select-file-btn__menu-item svg {
  flex-shrink: 0;
  color: var(--color-text-2);
}
.select-file-btn__menu-item-label {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

Remove: `left: 50%`, `transform: translateX(-50%)`, `min-width: 220px`, and the larger padding/radius values.

- [x] **Step 2: Visually verify**

Open the tools dropzone UI, open the Select File chevron menu, and confirm:
1. Left/right edges align with the button
2. Width equals the button
3. Menu looks denser than before
4. Labels do not wrap; long text would ellipsize

---

### Task 2: Wrap labels for ellipsis

**Files:**
- Modify: `components/tools/SelectFileButton.tsx`

**Interfaces:**
- Consumes: `.select-file-btn__menu-item-label` from Task 1
- Produces: truncated labels without layout expansion

- [x] **Step 1: Wrap item label and shrink icons to 14px**

In the menu item render, use `Icon size={14}` and wrap `{item.label}`:

```tsx
<Icon size={14} aria-hidden />
<span className="select-file-btn__menu-item-label">{item.label}</span>
```

Do not change handlers, `MENU_ITEMS`, or button markup outside the menu.

- [x] **Step 2: Confirm behavior unchanged**

- "From Computer" still opens the file picker
- Other items still show "Coming soon" toast
- Escape / outside click still close the menu
