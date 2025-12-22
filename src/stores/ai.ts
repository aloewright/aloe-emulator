import { defineStore } from 'pinia';
import { invoke } from '@tauri-apps/api/core';

interface AIState {
    models: string[];
    activeModel: string | null;
    suggestions: string[];
    isGenerating: boolean;
    error: string | null;
}

export const useAIStore = defineStore('ai', {
    state: (): AIState => ({
        models: [],
        activeModel: null,
        suggestions: [],
        isGenerating: false,
        error: null,
    }),

    actions: {
        async fetchModels() {
            try {
                const models = await invoke<string[]>('get_available_models');
                this.models = models;
                if (models.length > 0 && !this.activeModel) {
                    this.activeModel = models[0];
                }
            } catch (err) {
                this.error = `Failed to fetch models: ${err}`;
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
                // Clear previous suggestions for MVP since we just show one
                this.suggestions = [];
                const result = await invoke<string>('generate_command', {
                    model: this.activeModel,
                    prompt,
                    context: null,
                });
                this.suggestions.push(result);
            } catch (err) {
                this.error = `Generation failed: ${err}`;
            } finally {
                this.isGenerating = false;
            }
        }
    }
});
