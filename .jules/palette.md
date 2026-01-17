## 2024-05-22 - [Keyboard Navigation in Core UI]
**Learning:** Found that core navigation elements were implemented as `div`s with `click` handlers, making them completely inaccessible to keyboard users and screen readers.
**Action:** Replaced with semantic `<button>` elements, added `aria-label`, `aria-current`, and `focus-visible` styles. Always verify that interactive elements are keyboard accessible (tabbable and activatable).
