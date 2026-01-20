## 2025-05-22 - Debounce Data Loss in Streams
**Learning:** Standard `debounce` implementations (like the one in `src/utils/helpers.ts`) typically only pass the arguments of the *last* invocation to the callback. When used on a high-frequency data stream (like terminal output), this causes massive data loss as intermediate chunks are discarded.
**Action:** When debouncing a stream of data where integrity matters, ALWAYS accumulate the data in a buffer and have the debounced function process/send the entire buffer.
