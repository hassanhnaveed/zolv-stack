# Select File Dropdown UI Refinement

**Date:** 2026-07-15  
**Status:** Approved  
**Approach:** CSS-only stretch-to-button width (Approach 1), Option B density

## Goal

Refine the Select File dropdown so it aligns flush under the button, matches the button width exactly, and uses a compact visual density—without changing behavior.

## Layout & Alignment

- Position the dropdown directly beneath the Select File button using `top: calc(100% + 4-6px)`, `left: 0`, `right: 0`, and `width: 100%`.
- Remove `left: 50%`, `transform: translateX(-50%)`, and the fixed `min-width: 220px`.
- The dropdown width must always match the button width and remain fully responsive.

## Compact Design (Option B)

- Reduce the overall size of the dropdown for a clean, professional appearance.
- Menu: approximately `4px` internal padding, `8px` border radius (matching the button), and a subtle shadow.
- Menu items: `6-8px` vertical padding, `8-10px` horizontal padding, `8px` gap, `6px` border radius.
- Typography: `0.8125rem` font size with `font-weight: 500`.
- Icons: `14px`, using the existing muted secondary color and current hover behavior.

## Overflow

- Keep every menu item on a single line.
- Use `white-space: nowrap`, `overflow: hidden`, and `text-overflow: ellipsis` on the label.
- The dropdown must never expand beyond the width of the Select File button.

## Scope

- Implement styling in `app/globals.css` (`.select-file-btn__menu` and `.select-file-btn__menu-item`).
- Make only minimal TSX changes in `components/tools/SelectFileButton.tsx` if necessary (e.g. wrap the label in a `<span>` for ellipsis).
- Do not modify existing functionality or behavior. This is strictly a visual/UI refinement.

## Out of Scope

- Menu item content, actions, toast behavior, accessibility roles (aside from keeping existing ones)
- Redesigning the Select File button itself
