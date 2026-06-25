import { getChatApiUrl, sendChatMessage } from "@/lib/chat/api";
import { ChatRequest } from "@/lib/chat/types";

describe("chat api client", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  function locationFor(url: string) {
    const parsed = new URL(url);
    return {
      hostname: parsed.hostname,
      port: parsed.port,
    };
  }

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    jest.restoreAllMocks();
  });

  afterAll(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
    }
  });

  it("uses the FastAPI server during local Next.js development", () => {
    expect(
      getChatApiUrl(locationFor("http://localhost:3000/agreements/mutual-nda/"))
    ).toBe("http://localhost:8000/api/chat");
  });

  it("uses same-origin API path outside local Next.js development", () => {
    expect(
      getChatApiUrl(locationFor("https://example.com/agreements/mutual-nda/"))
    ).toBe("/api/chat");
  });

  it("uses configured API base URL when provided", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/";

    expect(
      getChatApiUrl(locationFor("http://localhost:3000/agreements/mutual-nda/"))
    ).toBe("https://api.example.com/api/chat");
  });

  it("posts chat requests to the resolved API URL", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        assistant_message: "Hello",
        extracted_fields: {},
      }),
    } as Response);
    global.fetch = fetchMock;
    const request: ChatRequest = {
      slug: "mutual-nda",
      history: [],
      user_message: "Hello",
    };

    await sendChatMessage(request);

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  });
});
