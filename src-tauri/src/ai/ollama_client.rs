use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::error::Error;

const DEFAULT_HOST: &str = "http://localhost:11434";

#[derive(Clone)]
pub struct OllamaClient {
    client: Client,
    host: String,
}

#[derive(Deserialize, Debug)]
pub struct ModelListResponse {
    pub models: Vec<ModelInfo>,
}

#[derive(Deserialize, Debug, Serialize)]
pub struct ModelInfo {
    pub name: String,
}

#[derive(Serialize, Debug)]
pub struct GenerateRequest {
    pub model: String,
    pub prompt: String,
    pub stream: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system: Option<String>,
}

#[derive(Deserialize, Debug)]
pub struct GenerateResponse {
    pub response: String,
    pub done: bool,
}

impl OllamaClient {
    pub fn new(host: Option<String>) -> Self {
        Self {
            client: Client::new(),
            host: host.unwrap_or_else(|| DEFAULT_HOST.to_string()),
        }
    }

    pub async fn list_models(&self) -> Result<Vec<String>, Box<dyn Error>> {
        let url = format!("{}/api/tags", self.host);
        let resp = self.client.get(&url).send().await?;
        let body: ModelListResponse = resp.json().await?;
        Ok(body.models.into_iter().map(|m| m.name).collect())
    }

    pub async fn generate(
        &self,
        model: &str,
        prompt: &str,
        system: Option<&str>,
    ) -> Result<String, Box<dyn Error>> {
        let url = format!("{}/api/generate", self.host);
        let req = GenerateRequest {
            model: model.to_string(),
            prompt: prompt.to_string(),
            stream: false,
            system: system.map(|s| s.to_string()),
        };

        let req_json = serde_json::to_string(&req)?;
        println!("[Ollama] Sending request to {}: {}", url, req_json);

        let resp = self.client.post(&url).json(&req).send().await?;
        let status = resp.status();
        println!("[Ollama] Response status: {}", status);

        if !status.is_success() {
            let error_text = resp.text().await?;
            eprintln!("[Ollama] API Error: {}", error_text);
            return Err(format!("Ollama API Error: {} - {}", status, error_text).into());
        }

        let body: GenerateResponse = resp.json().await?;
        println!("[Ollama] Parsed response: {:?}", body);
        Ok(body.response)
    }

    // For streaming, we'll implement later if needed via command layer,
    // but basic non-streaming generating is a good start for MVP suggestions.
}
