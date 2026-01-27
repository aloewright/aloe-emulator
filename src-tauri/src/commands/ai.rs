use crate::ai::context_builder::ContextBuilder;
use crate::ai::ollama_client::OllamaClient;
use crate::ai::openrouter_client::OpenRouterClient;

#[tauri::command]
pub async fn get_available_models(
    provider: String,
    api_key: Option<String>,
) -> Result<Vec<String>, String> {
    match provider.as_str() {
        "ollama" => {
            let client = OllamaClient::new(None);
            client.list_models().await.map_err(|e| e.to_string())
        }
        "openrouter" => {
            if let Some(key) = api_key {
                let client = OpenRouterClient::new(key);
                client.list_models().await.map_err(|e| e.to_string())
            } else {
                Err("OpenRouter API key is required".to_string())
            }
        }
        _ => Err(format!("Unknown provider: {}", provider)),
    }
}

#[tauri::command]
pub async fn generate_command(
    provider: String,
    model: String,
    prompt: String,
    context: Option<String>,
    api_key: Option<String>,
) -> Result<String, String> {
    let _ = context; // Suppress unused warning
    println!(
        "[AI] Generating command with provider: '{}', model: '{}'",
        provider, model
    );
    let context = ContextBuilder::build();
    let system_prompt = ContextBuilder::construct_system_prompt(&context);

    match provider.as_str() {
        "ollama" => {
            let client = OllamaClient::new(None);
            match client.generate(&model, &prompt, Some(&system_prompt)).await {
                Ok(response) => Ok(response),
                Err(e) => {
                    eprintln!("[AI] Error generating command: {}", e);
                    Err(e.to_string())
                }
            }
        }
        "openrouter" => {
            if let Some(key) = api_key {
                let client = OpenRouterClient::new(key);
                match client.generate(&model, &prompt, Some(&system_prompt)).await {
                    Ok(response) => Ok(response),
                    Err(e) => {
                        eprintln!("[AI] Error generating command: {}", e);
                        Err(e.to_string())
                    }
                }
            } else {
                Err("OpenRouter API key is required".to_string())
            }
        }
        _ => Err(format!("Unknown provider: {}", provider)),
    }
}
