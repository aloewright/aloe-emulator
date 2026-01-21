## 2025-05-22 - [Keyboard Accessibility in Forms]
**Learning:** Found a pattern where interactive elements inside inputs (password toggles, right icons) were explicitly removed from the tab order using `tabindex="-1"`. This prevents keyboard users from accessing these features.
**Action:** Always ensure interactive elements are focusable. Use `aria-label` for icon-only buttons to provide context to screen readers. Added `rightIconLabel` prop to form components to support this.
