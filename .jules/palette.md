## 2024-10-24 - Interactive Input Icons Accessibility
**Learning:** Icon-only buttons inside Inputs (like password toggle) were explicitly excluded from tab order (`tabindex="-1"`) and lacked labels, making them inaccessible to keyboard and screen reader users.
**Action:** Ensure all interactive icons inside form fields are keyboard accessible (no `tabindex="-1"`) and have descriptive ARIA labels.
