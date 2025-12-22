use serde::Serialize;
use std::path::PathBuf;

#[derive(Debug, Serialize, Default)]
pub struct CommandContext {
    pub cwd: String,
    pub history: Vec<String>,
    pub git_branch: Option<String>,
}

impl CommandContext {
    pub fn collect() -> Self {
        // TODO: Implement actual data collection
        Self {
            cwd: std::env::current_dir()
                .unwrap_or_else(|_| PathBuf::from("."))
                .to_string_lossy()
                .to_string(),
            history: vec![],
            git_branch: None,
        }
    }
}
