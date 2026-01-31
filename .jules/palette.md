# Palette's Journal

Critical UX and accessibility learnings.

## 2024-05-22 - Icon-Only Buttons Accessibility
**Learning:** Found pattern of using `tabindex="-1"` on icon-only buttons (like password toggle) presumably to remove them from tab order for "cleaner" navigation, but this completely blocks keyboard users from accessing these features.
**Action:** Always ensure interactive elements are in the tab order. If they are visually secondary, they still need to be accessible. Use ARIA labels to describe their function.
