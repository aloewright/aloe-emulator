# Bolt's Journal

## 2026-02-05 - Streaming vs Full Load
**Learning:** `tokio::fs::read` loads the entire file into memory as `Vec<u8>`, and converting it to `String` creates a second full copy. For unbounded files like shell history, this is O(file_size) memory usage. Streaming with `tokio::io::BufReader` and `read_until` reduces this to O(line_length).
**Action:** Use `BufReader` and streaming for reading potentially large files. Remember to import `tokio::io::AsyncBufReadExt` when using `read_until`.
