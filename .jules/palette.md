## 2026-01-30 - Navigation Accessibility
**Learning:** Found critical navigation elements implemented as `div`s with click handlers, making them inaccessible to keyboard users.
**Action:** Always check main navigation components (`TopBar`, `SideBar`) for semantic HTML (`<button>`, `<a>`) and ensure they are not just `div`s with listeners.
