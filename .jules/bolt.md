## 2024-05-23 - Terminal Data Loss in Debounce
**Learning:** Standard debounce functions (passing arguments only from the last call) are destructive for data streams like terminal output. This caused the AI analyzer to miss ~90% of terminal output during rapid updates.
**Action:** Use a buffering strategy (`aiAnalysisBuffer`) alongside debounce. Accumulate data in the buffer and flush it when the debounce timer fires or when the buffer fills up. Always verify `debounce` behavior (trailing edge vs leading edge, argument passing) before using it for data streams.
