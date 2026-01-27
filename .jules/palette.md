## 2026-01-27 - Accessibility Anti-Pattern: Tabindex -1 on Form Controls
**Learning:** Found critical accessibility issue in `Input.vue` where interactive buttons (password toggle) explicitly used `tabindex="-1"`, making them inaccessible to keyboard users. This seems to be a pattern to avoid focus rings for mouse users, but it breaks a11y.
**Action:** Always ensure interactive elements are keyboard accessible. Use `focus-visible` CSS pseudo-class to hide focus rings for mouse users while keeping them for keyboard users, instead of removing the element from tab order.
