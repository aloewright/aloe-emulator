## 2024-05-22 - Debounce vs Throttle for Terminal Input
**Learning:** For terminal input, using `debounce` (resetting timer on new input) is an anti-pattern because it introduces significant latency during rapid typing or pasting. If the user types faster than the delay, the data is never sent until they stop.
**Action:** Use `throttle` (or max-wait) for input streams. Ensure that even during continuous input, data is flushed at regular intervals (e.g., 16ms/60fps) to maintain responsiveness.
