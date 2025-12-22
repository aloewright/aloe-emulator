use std::env;

#[derive(Debug, Clone)]
pub struct CommandContext {
    pub os: String,
    pub shell: String,
}

pub struct ContextBuilder;

impl ContextBuilder {
    /// Gather current system context
    pub fn build() -> CommandContext {
        CommandContext {
            os: env::consts::OS.to_string(),
            shell: env::var("SHELL").unwrap_or_else(|_| "unknown".to_string()),
        }
    }

    /// Construct a system prompt based on context
    pub fn construct_system_prompt(context: &CommandContext) -> String {
        format!(
            "You are an expert command-line assistant. \
            The user is on operating system '{}' using shell '{}'. \
            Your task is to provide a SINGLE, EXECUTABLE shell command that fulfills the user's request. \
            Do NOT provide explanations, markdown formatting, or code blocks. Just the raw command string ready to run. \
            If the request is dangerous, provide a warning starting with '#' instead of a command.",
            context.os, context.shell
        )
    }
}
