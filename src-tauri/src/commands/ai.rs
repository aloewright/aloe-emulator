use crate::ai::ollama_client::OllamaClient;

#[tauri::command]
pub async fn get_available_models() -> Result<Vec<String>, String> {
    let client = OllamaClient::new(None);
    client.list_models().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn generate_command(
    model: String,
    prompt: String,
    _context: Option<String>,
) -> Result<String, String> {
    let client = OllamaClient::new(None);
    // TODO: Use context to build a better prompt
    client.generate(&model, &prompt, None).await.map_err(|e| e.to_string())
}
