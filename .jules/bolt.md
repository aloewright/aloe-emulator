## 2024-05-23 - Debounce Data Loss
**Learning:** The custom `debounce` utility in `src/utils/helpers.ts` only passes arguments from the *last* invocation. Using it for data streams (like terminal output) results in data loss.
**Action:** Use a buffering pattern (accumulate -> debounce flush -> clear) for streams instead of direct debouncing.
