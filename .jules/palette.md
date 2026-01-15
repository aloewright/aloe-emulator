## 2024-05-23 - Accessibility of Interactive Icons in Form Inputs
**Learning:** Icon-only buttons embedded within form inputs (like password toggles or search icons) often get excluded from the tab order (`tabindex="-1"`) to "simplify" navigation, but this makes them inaccessible to keyboard users.
**Action:** Always ensure interactive icons are keyboard focusable (natural tab order or explicit `tabindex="0"`) and have clear `aria-label` attributes describing their function (e.g., "Show password", "Search"). Use `rightIconLabel` props for flexibility.
