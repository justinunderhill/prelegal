import { sendChatMessage } from "@/lib/chat/api";

describe("sendChatMessage", () => {
  const mockRequest = {
    slug: "mutual-nda",
    history: [] as { role: "user" | "assistant"; content: string }[],
    user_message: "Hello",
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("sends a POST request to /api/chat", async () => {
    const mockResponse = {
      assistant_message: "Hi! What is the purpose?",
      extracted_fields: {},
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as unknown as Response);

    const result = await sendChatMessage(mockRequest);

    expect(global.fetch).toHaveBeenCalledWith("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockRequest),
    });
    expect(result).toEqual(mockResponse);
  });

  it("throws on non-ok response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: async () => "AI service error",
    } as unknown as Response);

    await expect(sendChatMessage(mockRequest)).rejects.toThrow(
      "Chat API error (502)"
    );
  });
});
