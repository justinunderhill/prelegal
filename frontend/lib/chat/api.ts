import { ChatRequest, ChatResponse } from "./types";

const CHAT_API_PATH = "/api/chat";

type RuntimeLocation = Pick<Location, "hostname" | "port">;

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getApiBaseUrl(location?: RuntimeLocation): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return trimTrailingSlash(configuredBaseUrl);
  }

  const runtimeLocation =
    location ?? (typeof window !== "undefined" ? window.location : undefined);

  if (runtimeLocation) {
    const { hostname, port } = runtimeLocation;
    const isLocalFrontend =
      (hostname === "localhost" || hostname === "127.0.0.1") &&
      (port === "3000" || port === "3001");

    if (isLocalFrontend) {
      return "http://localhost:8000";
    }
  }

  return "";
}

export function getChatApiUrl(location?: RuntimeLocation): string {
  return `${getApiBaseUrl(location)}${CHAT_API_PATH}`;
}

export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  const res = await fetch(getChatApiUrl(), {
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
