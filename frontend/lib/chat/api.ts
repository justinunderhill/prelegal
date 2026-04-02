import { ChatRequest, ChatResponse } from "./types";

export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "Unknown error");
    throw new Error(`Chat API error (${res.status}): ${detail}`);
  }
  return res.json();
}
