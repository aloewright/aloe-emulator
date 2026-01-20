# Palette's Journal - UX & Accessibility Learnings

## 2025-05-23 - Keyboard Focus Visibility and Form Accessibility
**Learning:**
1.  **Invisible Focus Rings:** The project uses `focus:outline-none` on buttons but relies on `focus:ring-{color}` without a width (like `ring-2`). This renders focus states invisible for keyboard users.
2.  **Keyboard Traps in Inputs:** The `Input.vue` component explicitly removed password toggle and right icon buttons from the tab order (`tabindex="-1"`), creating accessibility dead zones for keyboard users.
3.  **Missing Accessible Names:** Interactive icons often lacked `aria-label`, relying on visual cues alone.

**Action:**
1.  **Global Button Fix:** Updated `Button.vue` to include `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900`. This ensures a high-contrast focus ring appears *only* for keyboard users (via `focus-visible`), respecting the "no outline on click" design preference for mouse users.
2.  **Input Accessibility:** Removed `tabindex="-1"` from interactive icon buttons in inputs. Added dynamic `aria-label` for password toggles and a new `rightIconLabel` prop for generic action icons.
3.  **Future:** Always verify that `focus:ring-{color}` is accompanied by `ring-{width}` (or `focus:ring-{width}`) or use the dedicated `Button` component which now handles this safely.
