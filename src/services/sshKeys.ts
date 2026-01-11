import { invoke } from "@tauri-apps/api/core";

/**
 * Represents a discovered local SSH key
 */
export interface LocalSSHKey {
  name: string;
  path: string;
  key_type: string;
  has_passphrase: boolean;
  public_key_path: string | null;
  fingerprint: string | null;
}

/**
 * Service for managing local SSH key discovery
 */
export class SSHKeysService {
  private static instance: SSHKeysService;
  private cachedKeys: LocalSSHKey[] | null = null;
  private lastScanTime: number = 0;
  private cacheDuration = 60000; // Cache for 1 minute

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): SSHKeysService {
    if (!SSHKeysService.instance) {
      SSHKeysService.instance = new SSHKeysService();
    }
    return SSHKeysService.instance;
  }

  /**
   * Scan the local ~/.ssh directory for SSH keys
   * Results are cached to avoid repeated filesystem scans
   */
  async scanLocalKeys(forceRefresh = false): Promise<LocalSSHKey[]> {
    const now = Date.now();

    // Return cached results if still valid
    if (
      !forceRefresh &&
      this.cachedKeys !== null &&
      now - this.lastScanTime < this.cacheDuration
    ) {
      return this.cachedKeys;
    }

    try {
      const keys = await invoke<LocalSSHKey[]>("scan_local_ssh_keys");
      this.cachedKeys = keys;
      this.lastScanTime = now;
      return keys;
    } catch (error) {
      console.error("Failed to scan local SSH keys:", error);
      return this.cachedKeys ?? [];
    }
  }

  /**
   * Clear the cached keys
   */
  clearCache(): void {
    this.cachedKeys = null;
    this.lastScanTime = 0;
  }

  /**
   * Get keys filtered by type
   */
  async getKeysByType(keyType: string): Promise<LocalSSHKey[]> {
    const keys = await this.scanLocalKeys();
    return keys.filter(
      (key) => key.key_type.toLowerCase() === keyType.toLowerCase(),
    );
  }

  /**
   * Get keys that don't require a passphrase
   */
  async getUnprotectedKeys(): Promise<LocalSSHKey[]> {
    const keys = await this.scanLocalKeys();
    return keys.filter((key) => !key.has_passphrase);
  }

  /**
   * Get keys that have a corresponding public key
   */
  async getKeysWithPublicKey(): Promise<LocalSSHKey[]> {
    const keys = await this.scanLocalKeys();
    return keys.filter((key) => key.public_key_path !== null);
  }

  /**
   * Find a key by name
   */
  async findKeyByName(name: string): Promise<LocalSSHKey | undefined> {
    const keys = await this.scanLocalKeys();
    return keys.find((key) => key.name === name);
  }

  /**
   * Find a key by path
   */
  async findKeyByPath(path: string): Promise<LocalSSHKey | undefined> {
    const keys = await this.scanLocalKeys();
    return keys.find((key) => key.path === path);
  }
}

// Export singleton instance
export const sshKeysService = SSHKeysService.getInstance();

// Export convenience function
export async function scanLocalSSHKeys(
  forceRefresh = false,
): Promise<LocalSSHKey[]> {
  return sshKeysService.scanLocalKeys(forceRefresh);
}
