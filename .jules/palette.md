## 2024-05-23 - Focus Management and Keyboard Accessibility
**Learning:** Found `tabindex="-1"` being used on interactive buttons (password toggle) within inputs to prevent focus, likely to avoid "double focus" issues visually, but this breaks keyboard accessibility. Also, `focus:ring` caused visual noise for mouse users.
**Action:** Use `focus-visible` for focus rings to keep UI clean for mouse users while ensuring keyboard accessibility. Remove `tabindex="-1"` from interactive elements.
