## 2024-05-22 - Accessibility Gaps in Form Components
**Learning:** Found that `Button.vue` relied on `focus:ring-*` without a width (e.g., `ring-2`), making focus states invisible. Also, `Input.vue` auxiliary buttons (password toggle, right icon) were explicitly removed from tab order (`tabindex="-1"`), making them inaccessible to keyboard users.
**Action:** Ensure all interactive elements have visible focus states (using `focus-visible` for buttons) and remain in the natural tab order unless there is a specific reason to remove them. Always provide `aria-label` for icon-only buttons.
