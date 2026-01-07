use crate::models::buffer::TerminalBufferChunk;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Statistics about the buffer manager
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BufferStats {
    pub total_terminals: usize,
    pub total_lines: usize,
    pub memory_usage: usize,
}

/// Terminal buffer data structure
#[derive(Debug, Clone)]
struct TerminalBuffer {
    lines: Vec<String>,
    total_bytes: usize,
}

impl TerminalBuffer {
    fn new() -> Self {
        Self {
            lines: Vec::new(),
            total_bytes: 0,
        }
    }

    fn append_data(&mut self, data: &str, max_lines: usize) {
        let mut lines_iter = data.split('\n');

        // Always try to merge the first part of the split with the last line of the buffer.
        // split('\n') always returns at least one element.
        // e.g., "abc".split('\n') -> ["abc"]
        //       "\nabc".split('\n') -> ["", "abc"]
        //       "abc\n".split('\n') -> ["abc", ""]
        //
        // By merging the first element, we correctly handle continuation of the last line.
        // If the data starts with '\n', the first element is "", so merging adds nothing,
        // effectively terminating the previous line.
        if !self.lines.is_empty() {
            if let Some(first_part) = lines_iter.next() {
                if let Some(last_line) = self.lines.last_mut() {
                    last_line.push_str(first_part);
                    self.total_bytes += first_part.len();
                }
            }
        }

        // Push the rest of the lines (if any)
        for line in lines_iter {
            self.lines.push(line.to_string());
            self.total_bytes += line.len() + 1; // +1 for newline
        }

        if self.lines.len() > max_lines {
            let lines_to_remove = self.lines.len() - max_lines;

            // Calculate bytes to remove before draining
            let bytes_removed: usize = self.lines
                .iter()
                .take(lines_to_remove)
                .map(|s| s.len() + 1)
                .sum();

            // Efficiently remove multiple items from the beginning
            self.lines.drain(0..lines_to_remove);
            self.total_bytes = self.total_bytes.saturating_sub(bytes_removed);
        }
    }

    fn get_lines(&self) -> &Vec<String> {
        &self.lines
    }

    fn get_as_string(&self) -> String {
        self.lines.join("\n")
    }

    fn get_memory_usage(&self) -> usize {
        self.total_bytes
    }
}

/// Manager for terminal output buffers
pub struct TerminalBufferManager {
    buffers: Arc<RwLock<HashMap<String, TerminalBuffer>>>,
    max_lines_per_terminal: usize,
}

impl TerminalBufferManager {
    /// Create a new buffer manager
    pub fn new(max_lines_per_terminal: usize) -> Self {
        Self {
            buffers: Arc::new(RwLock::new(HashMap::new())),
            max_lines_per_terminal,
        }
    }

    /// Save data to a terminal's buffer
    pub async fn save_data(&self, terminal_id: &str, data: &str) {
        let mut buffers = self.buffers.write().await;
        let buffer = buffers
            .entry(terminal_id.to_string())
            .or_insert_with(TerminalBuffer::new);
        buffer.append_data(data, self.max_lines_per_terminal);
    }

    /// Get buffer as string for a terminal
    pub async fn get_buffer_string(&self, terminal_id: &str) -> Option<String> {
        let buffers = self.buffers.read().await;
        buffers
            .get(terminal_id)
            .map(|buffer| buffer.get_as_string())
    }

    /// Get buffer chunk for a terminal
    pub async fn get_buffer_chunk(
        &self,
        terminal_id: &str,
        start_line: usize,
        chunk_size: usize,
    ) -> TerminalBufferChunk {
        let buffers = self.buffers.read().await;

        if let Some(buffer) = buffers.get(terminal_id) {
            let lines = buffer.get_lines();
            let total_lines = lines.len();

            let end_line = std::cmp::min(start_line + chunk_size, total_lines);
            let has_more = end_line < total_lines;

            let chunk_lines = if start_line < total_lines {
                &lines[start_line..end_line]
            } else {
                &[]
            };

            let data = chunk_lines.join("\n");

            TerminalBufferChunk {
                terminal_id: terminal_id.to_string(),
                start_line,
                end_line,
                total_lines,
                data,
                has_more,
            }
        } else {
            TerminalBufferChunk {
                terminal_id: terminal_id.to_string(),
                start_line: 0,
                end_line: 0,
                total_lines: 0,
                data: String::new(),
                has_more: false,
            }
        }
    }

    /// Check if a terminal has a buffer
    pub async fn has_buffer(&self, terminal_id: &str) -> bool {
        let buffers = self.buffers.read().await;
        buffers.contains_key(terminal_id)
    }

    /// Remove buffer for a specific terminal
    pub async fn remove_buffer(&self, terminal_id: &str) {
        let mut buffers = self.buffers.write().await;
        buffers.remove(terminal_id);
    }

    /// Get buffer statistics
    pub async fn get_stats(&self) -> BufferStats {
        let buffers = self.buffers.read().await;
        let total_terminals = buffers.len();
        let mut total_lines = 0;
        let mut memory_usage = 0;

        for buffer in buffers.values() {
            total_lines += buffer.get_lines().len();
            memory_usage += buffer.get_memory_usage();
        }

        BufferStats {
            total_terminals,
            total_lines,
            memory_usage,
        }
    }

    /// Cleanup orphaned buffers (call with list of active terminal IDs)
    pub async fn cleanup_orphaned_buffers(&self, active_terminal_ids: &[String]) {
        let mut buffers = self.buffers.write().await;

        let mut to_remove = Vec::new();
        for terminal_id in buffers.keys() {
            if !active_terminal_ids.contains(terminal_id) {
                to_remove.push(terminal_id.clone());
            }
        }

        for terminal_id in to_remove {
            buffers.remove(&terminal_id);
        }
    }
}

impl Default for TerminalBufferManager {
    fn default() -> Self {
        Self::new(1000) // Default to 1000 lines per terminal
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_append_data_simple() {
        let mut buffer = TerminalBuffer::new();
        buffer.append_data("line1", 100);
        assert_eq!(buffer.lines, vec!["line1"]);

        buffer.append_data("\nline2", 100);
        assert_eq!(buffer.lines, vec!["line1", "line2"]);
    }

    #[test]
    fn test_append_data_merge() {
        let mut buffer = TerminalBuffer::new();
        buffer.append_data("hel", 100);
        buffer.append_data("lo", 100);
        assert_eq!(buffer.lines, vec!["hello"]);
    }

    #[test]
    fn test_append_data_with_newlines() {
        let mut buffer = TerminalBuffer::new();
        buffer.append_data("one\ntwo\nthree", 100);
        assert_eq!(buffer.lines, vec!["one", "two", "three"]);
    }

    #[test]
    fn test_max_lines_limit() {
        let mut buffer = TerminalBuffer::new();
        // 3 lines + empty line at end
        buffer.append_data("1\n2\n3\n", 5);
        // buffer: ["1", "2", "3", ""]
        assert_eq!(buffer.lines, vec!["1", "2", "3", ""]);

        buffer.append_data("4\n5\n", 5);
        // buffer before crop: ["1", "2", "3", "4", "5", ""]
        // crop to 5: remove "1"
        assert_eq!(buffer.lines, vec!["2", "3", "4", "5", ""]);
    }

    #[test]
    fn test_memory_usage() {
        let mut buffer = TerminalBuffer::new();
        buffer.append_data("a", 100);
        // code: total_bytes += line.len() + 1
        // "a" -> 1+1 = 2.
        assert_eq!(buffer.total_bytes, 2);

        buffer.append_data("b", 100);
        // "ab" -> merged.
        // total_bytes += "b".len() = 1. Total 3.
        // lines: ["ab"]. "ab" len 2. +1 = 3. Consistent.
        assert_eq!(buffer.total_bytes, 3);
    }
}
