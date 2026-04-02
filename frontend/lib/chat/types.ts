export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  slug: string;
  history: ChatMessage[];
  user_message: string;
}

export interface ChatResponse {
  assistant_message: string;
  extracted_fields: Record<string, string>;
}

export type BuilderMode = "chat" | "form";
