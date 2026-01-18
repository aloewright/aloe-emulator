# Palette's Journal - UX & Accessibility Learnings

This journal tracks CRITICAL UX and accessibility learnings specific to this project.
Only unique, high-value insights are recorded here.

## Format

`## YYYY-MM-DD - [Title]`
`**Learning:** [UX/a11y insight]`
`**Action:** [How to apply next time]`

---

## 2024-10-24 - The `tabindex="-1"` Anti-Pattern in Inputs

**Learning:** Found critical form inputs (Input.vue, Select.vue) where interactive utility buttons (toggle password, right-icons) were explicitly removed from tab order with `tabindex="-1"`. This made them completely inaccessible to keyboard users, preventing essential actions like revealing passwords or triggering field-specific actions.
**Action:** Always check `tabindex` on interactive elements within custom input wrappers. Ensure all interactive parts of a form field remain in the natural tab order and have appropriate `aria-label`s.
