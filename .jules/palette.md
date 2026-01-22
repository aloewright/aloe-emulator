# Palette's Journal

## 2025-02-23 - Interactive Elements Removed from Tab Order
**Learning:** Found a pattern where interactive helper buttons (password toggle, right icon actions) in form inputs were explicitly removed from the tab order using `tabindex="-1"`. This makes these features completely inaccessible to keyboard-only users.
**Action:** Always ensure interactive elements are keyboard focusable. Use `aria-label` to describe icon-only buttons instead of hiding them from assistive technology. If an element is interactive, it must be focusable.
