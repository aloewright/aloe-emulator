use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::error::Error;

const OPENROUTER_API_URL: &str = "https://openrouter.ai/api/v1";

#[derive(Clone)]
pub struct OpenRouterClient {
    client: Client,
    api_key: String,
}

#[derive(Deserialize, Debug)]
struct OpenRouterModelListResponse {
    data: Vec<OpenRouterModel>,
}

#[derive(Deserialize, Debug)]
struct OpenRouterModel {
    id: String,
    // We can add more fields if needed like context_length, pricing, etc.
}

#[derive(Serialize, Debug)]
struct ChatCompletionRequest {
    model: String,
    messages: Vec<Message>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Message {
    role: String,
    content: String,
}

#[derive(Deserialize, Debug)]
struct ChatCompletionResponse {
    choices: Vec<Choice>,
}

#[derive(Deserialize, Debug)]
struct Choice {
    message: Message,
}

impl OpenRouterClient {
    pub fn new(api_key: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
        }
    }

    pub async fn list_models(&self) -> Result<Vec<String>, Box<dyn Error>> {
        let url = format!("{}/models", OPENROUTER_API_URL);
        let resp = self.client.get(&url).send().await?;

        if !resp.status().is_success() {
            return Err(format!("OpenRouter API Error: {}", resp.status()).into());
        }

        let body: OpenRouterModelListResponse = resp.json().await?;
        Ok(body.data.into_iter().map(|m| m.id).collect())
    }

    pub async fn generate(
        &self,
        model: &str,
        prompt: &str,
        system: Option<&str>,
    ) -> Result<String, Box<dyn Error>> {
        let url = format!("{}/chat/completions", OPENROUTER_API_URL);

        let mut messages = Vec::new();
        if let Some(sys_prompt) = system {
            messages.push(Message {
                role: "system".to_string(),
                content: sys_prompt.to_string(),
            });
        }
        messages.push(Message {
            role: "user".to_string(),
            content: prompt.to_string(),
        });

        let req = ChatCompletionRequest {
            model: model.to_string(),
            messages,
        };

        // Suppress unused warning if req_json was used only for logging
        let _ = serde_json::to_string(&req)?;

        let resp = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("HTTP-Referer", "https://github.com/aloe/local-warp") // Recommended by OpenRouter
            .header("X-Title", "Aloe Terminal") // Recommended by OpenRouter
            .json(&req)
            .send()
            .await?;

        let status = resp.status();
        println!("[OpenRouter] Response status: {}", status);

        if !status.is_success() {
            let error_text = resp.text().await?;
            eprintln!("[OpenRouter] API Error: {}", error_text);
            return Err(format!("OpenRouter API Error: {} - {}", status, error_text).into());
        }

        let body: ChatCompletionResponse = resp.json().await?;

        if let Some(choice) = body.choices.first() {
            Ok(choice.message.content.clone())
        } else {
            Err("No choices returned from OpenRouter".into())
        }
    }
}
