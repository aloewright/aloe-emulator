import { AIContextAnalyzer } from "../services/aiContextAnalyzer";

// Types
type AnalyzeMessage = { type: 'analyze'; data: string };
type WorkerMessage = AnalyzeMessage;

type SuggestionResponse = { type: 'suggestion'; payload: any };
type ServerUrlResponse = { type: 'server-url'; payload: string };
type ErrorResponse = { type: 'error'; payload: { message: string; stack?: string } };
type WorkerResponse = SuggestionResponse | ServerUrlResponse | ErrorResponse;

const analyzer = new AIContextAnalyzer();

// Type guard
function isAnalyzeMessage(msg: any): msg is AnalyzeMessage {
  return msg && typeof msg === 'object' && msg.type === 'analyze' && typeof msg.data === 'string';
}

// Global error handler
self.onerror = (e) => {
  const error = e instanceof ErrorEvent ? e.error : new Error(String(e));
  const response: ErrorResponse = {
    type: 'error',
    payload: {
      message: error.message || 'Unknown worker error',
      stack: error.stack
    }
  };
  self.postMessage(response);
};

self.onmessage = (e: MessageEvent) => {
  try {
    if (!e.data || typeof e.data !== 'object') {
      return;
    }

    if (isAnalyzeMessage(e.data)) {
      const { data } = e.data;

      // Analyze for suggestions
      const suggestion = analyzer.analyzeOutput(data);
      if (suggestion) {
        const response: SuggestionResponse = { type: 'suggestion', payload: suggestion };
        self.postMessage(response);
      }

      // Analyze for server URL
      const serverUrl = analyzer.detectServerUrl(data);
      if (serverUrl) {
        const response: ServerUrlResponse = { type: 'server-url', payload: serverUrl };
        self.postMessage(response);
      }
    }
  } catch (error: any) {
    const response: ErrorResponse = {
      type: 'error',
      payload: {
        message: error.message || 'Error processing message',
        stack: error.stack
      }
    };
    self.postMessage(response);
  }
};
