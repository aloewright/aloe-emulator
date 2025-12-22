import { defineStore } from 'pinia';
import { invoke } from '@tauri-apps/api/core';
import { LazyStore } from '@tauri-apps/plugin-store';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';

const store = new LazyStore('settings.json');

type AIProvider = 'ollama' | 'openrouter';

interface AIState {
    models: string[];
    activeModel: string | null;
    activeProvider: AIProvider;
    openRouterKey: string | null;
    suggestions: string[];
    isGenerating: boolean;
    error: string | null;
}

export const useAIStore = defineStore('ai', {
    state: (): AIState => ({
        models: [],
        activeModel: null,
        activeProvider: 'ollama',
        openRouterKey: null,
        suggestions: [],
        isGenerating: false,
        error: null,
    }),

    actions: {
        async init() {
            try {
                const savedProvider = await store.get<string>('ai_provider');
                if (savedProvider) {
                    this.activeProvider = savedProvider as AIProvider;
                }
                const savedKey = await store.get<string>('ai_openrouter_key');
                if (savedKey) {
                    this.openRouterKey = savedKey;
                }
                await this.fetchModels();
            } catch (err) {
                console.error('Failed to load AI settings:', err);
            }
        },

        async setProvider(provider: AIProvider) {
            this.activeProvider = provider;
            await store.set('ai_provider', provider);
            await store.save();
            this.models = [];
            this.activeModel = null;
            await this.fetchModels();
        },

        async setOpenRouterKey(key: string) {
            this.openRouterKey = key;
            await store.set('ai_openrouter_key', key);
            await store.save();
            if (this.activeProvider === 'openrouter') {
                await this.fetchModels();
            }
        },

        async fetchModels() {
            this.error = null;
            try {
                let args: any = { provider: this.activeProvider, apiKey: null };

                if (this.activeProvider === 'openrouter') {
                    if (!this.openRouterKey) {
                        // Don't fetch if no key, but don't error yet
                        this.models = [];
                        return;
                    }
                    args.apiKey = this.openRouterKey;
                }

                const models = await invoke<string[]>('get_available_models', args);
                this.models = models;

                // Set default model if none selected or current one not in list
                if (models.length > 0) {
                    if (!this.activeModel || !models.includes(this.activeModel)) {
                        this.activeModel = models[0];
                    }
                } else {
                    this.activeModel = null;
                }
            } catch (err) {
                this.error = `Failed to fetch models: ${err}`;
                this.models = [];
            }
        },

        async generateCommand(prompt: string) {
            if (!this.activeModel) {
                this.error = "No model selected";
                return;
            }

            this.isGenerating = true;
            this.error = null;

            try {
                this.suggestions = [];
                const result = await invoke<string>('generate_command', {
                    provider: this.activeProvider,
                    model: this.activeModel,
                    prompt,
                    context: null,
                    apiKey: this.openRouterKey,
                });

                // Sanitize the result to remove markdown code blocks
                // Matches content inside ```...``` or just the raw content if no blocks
                // Also strips leading/trailing newlines/spaces
                let cleanResult = result.trim();

                // Regex to capture content inside ```bash ... ``` or just ``` ... ```
                // We use [\s\S]*? to match across newlines
                const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/;
                const match = cleanResult.match(codeBlockRegex);

                if (match && match[1]) {
                    cleanResult = match[1].trim();
                }

                // Fallback: If starts with ` and ends with `, strip them (inline code)
                if (cleanResult.startsWith('`') && cleanResult.endsWith('`')) {
                    cleanResult = cleanResult.slice(1, -1).trim();
                }

                this.suggestions.push(cleanResult);
            } catch (err) {
                this.error = `Generation failed: ${err}`;
            } finally {
                this.isGenerating = false;
            }
        },

        async copyToClipboard(text: string) {
            try {
                await writeText(text);
            } catch (err) {
                console.error('Failed to copy to clipboard:', err);
                this.error = `Failed to copy: ${err}`;
            }
        }
    }
});
