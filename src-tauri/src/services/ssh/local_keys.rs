use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

/// Represents a discovered local SSH key
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalSSHKey {
    pub name: String,
    pub path: String,
    pub key_type: String,
    pub has_passphrase: bool,
    pub public_key_path: Option<String>,
    pub fingerprint: Option<String>,
}

/// Common SSH key file patterns to look for
const SSH_KEY_PATTERNS: &[&str] = &[
    "id_rsa",
    "id_ed25519", 
    "id_ecdsa",
    "id_dsa",
    "id_xmss",
    "identity",
];

/// Scan the local ~/.ssh directory for SSH keys
pub fn scan_local_ssh_keys() -> Result<Vec<LocalSSHKey>, String> {
    let ssh_dir = get_ssh_directory()?;
    
    if !ssh_dir.exists() {
        return Ok(Vec::new());
    }

    let mut keys = Vec::new();

    // Read directory entries
    let entries = fs::read_dir(&ssh_dir)
        .map_err(|e| format!("Failed to read SSH directory: {}", e))?;

    for entry in entries.flatten() {
        let path = entry.path();
        
        // Skip directories and public key files
        if path.is_dir() || path.extension().map_or(false, |ext| ext == "pub") {
            continue;
        }

        // Check if this is a private key file
        if let Some(key) = try_parse_ssh_key(&path) {
            keys.push(key);
        }
    }

    // Also check for keys referenced in SSH config
    if let Ok(config_keys) = parse_ssh_config_keys(&ssh_dir) {
        for key in config_keys {
            if !keys.iter().any(|k| k.path == key.path) {
                keys.push(key);
            }
        }
    }

    Ok(keys)
}

/// Get the SSH directory path
fn get_ssh_directory() -> Result<PathBuf, String> {
    let home = std::env::var("HOME")
        .map_err(|_| "Cannot determine HOME directory".to_string())?;
    Ok(PathBuf::from(home).join(".ssh"))
}

/// Try to parse an SSH key file and extract metadata
fn try_parse_ssh_key(path: &PathBuf) -> Option<LocalSSHKey> {
    let file_name = path.file_name()?.to_str()?;
    
    // Check if it matches known patterns or read content to verify
    let _is_known_pattern = SSH_KEY_PATTERNS.iter().any(|p| file_name.starts_with(p));
    
    // Read file content to verify it's a key
    let content = fs::read_to_string(path).ok()?;
    
    // Check for private key markers
    if !content.contains("PRIVATE KEY") && !content.contains("OPENSSH PRIVATE KEY") {
        return None;
    }

    let key_type = detect_key_type(&content);
    let has_passphrase = detect_passphrase(&content);
    
    // Check for corresponding public key
    let pub_key_path = path.with_extension("pub");
    let public_key_path = if pub_key_path.exists() {
        Some(pub_key_path.to_string_lossy().to_string())
    } else {
        None
    };

    // Try to get fingerprint from public key
    let fingerprint = public_key_path.as_ref().and_then(|_| {
        get_key_fingerprint(path).ok()
    });

    Some(LocalSSHKey {
        name: file_name.to_string(),
        path: path.to_string_lossy().to_string(),
        key_type,
        has_passphrase,
        public_key_path,
        fingerprint,
    })
}

/// Detect the type of SSH key from its content
fn detect_key_type(content: &str) -> String {
    if content.contains("BEGIN RSA PRIVATE KEY") {
        "RSA".to_string()
    } else if content.contains("BEGIN EC PRIVATE KEY") || content.contains("ecdsa") {
        "ECDSA".to_string()
    } else if content.contains("BEGIN DSA PRIVATE KEY") {
        "DSA".to_string()
    } else if content.contains("ssh-ed25519") || content.contains("ed25519") {
        "Ed25519".to_string()
    } else if content.contains("BEGIN OPENSSH PRIVATE KEY") {
        // Modern OpenSSH format - need to check further
        if content.contains("ssh-rsa") {
            "RSA".to_string()
        } else if content.contains("ssh-ed25519") {
            "Ed25519".to_string()
        } else if content.contains("ecdsa") {
            "ECDSA".to_string()
        } else {
            "OpenSSH".to_string()
        }
    } else {
        "Unknown".to_string()
    }
}

/// Detect if the key appears to be encrypted (has passphrase)
fn detect_passphrase(content: &str) -> bool {
    // Old PEM format encryption headers
    if content.contains("ENCRYPTED") || content.contains("Proc-Type: 4,ENCRYPTED") {
        return true;
    }
    
    // Modern OpenSSH format - check for bcrypt encryption marker
    // This is a heuristic; true detection would require parsing the key format
    if content.contains("BEGIN OPENSSH PRIVATE KEY") {
        // Modern keys with passphrase use bcrypt
        // The actual detection is complex, so we assume unencrypted by default
        // unless we see encryption indicators
        return content.contains("aes") || content.contains("bcrypt");
    }
    
    false
}

/// Try to get the key fingerprint using ssh-keygen
fn get_key_fingerprint(key_path: &PathBuf) -> Result<String, String> {
    use std::process::Command;
    
    let output = Command::new("ssh-keygen")
        .args(["-lf", &key_path.to_string_lossy()])
        .output()
        .map_err(|e| format!("Failed to run ssh-keygen: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        // Extract fingerprint from output like "2048 SHA256:xxx... comment (RSA)"
        if let Some(fp_start) = stdout.find("SHA256:") {
            let fp_part = &stdout[fp_start..];
            if let Some(space_pos) = fp_part.find(' ') {
                return Ok(fp_part[..space_pos].to_string());
            }
        }
    }
    
    Err("Could not extract fingerprint".to_string())
}

/// Parse SSH config file for IdentityFile entries
fn parse_ssh_config_keys(ssh_dir: &PathBuf) -> Result<Vec<LocalSSHKey>, String> {
    let config_path = ssh_dir.join("config");
    
    if !config_path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read SSH config: {}", e))?;

    let mut keys = Vec::new();
    
    for line in content.lines() {
        let line = line.trim();
        if line.to_lowercase().starts_with("identityfile") {
            // Parse: IdentityFile ~/.ssh/key_name or IdentityFile /path/to/key
            let parts: Vec<&str> = line.splitn(2, char::is_whitespace).collect();
            if parts.len() == 2 {
                let key_path = parts[1].trim();
                
                // Expand ~ to home directory
                let expanded_path = if key_path.starts_with("~/") {
                    let home = std::env::var("HOME").unwrap_or_default();
                    key_path.replacen("~", &home, 1)
                } else {
                    key_path.to_string()
                };
                
                let path = PathBuf::from(&expanded_path);
                if path.exists() {
                    if let Some(key) = try_parse_ssh_key(&path) {
                        keys.push(key);
                    }
                }
            }
        }
    }

    Ok(keys)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_key_type() {
        assert_eq!(detect_key_type("-----BEGIN RSA PRIVATE KEY-----"), "RSA");
        assert_eq!(detect_key_type("-----BEGIN EC PRIVATE KEY-----"), "ECDSA");
        assert_eq!(detect_key_type("-----BEGIN OPENSSH PRIVATE KEY-----\nssh-ed25519"), "Ed25519");
    }
}
