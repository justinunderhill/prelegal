import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatPanel } from "@/components/builder/chat/ChatPanel";
import * as chatApi from "@/lib/chat/api";

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = jest.fn();

jest.mock("@/lib/chat/api");

const mockSendChatMessage = chatApi.sendChatMessage as jest.MockedFunction<
  typeof chatApi.sendChatMessage
>;

describe("ChatPanel", () => {
  const defaultProps = {
    slug: "mutual-nda",
    agreementName: "Mutual Non-Disclosure Agreement",
    onFieldsExtracted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock: initial greeting
    mockSendChatMessage.mockResolvedValue({
      assistant_message: "Hello! What is the purpose of this NDA?",
      extracted_fields: {},
    });
  });

  it("renders and sends initial greeting", async () => {
    render(<ChatPanel {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText("Hello! What is the purpose of this NDA?")
      ).toBeInTheDocument();
    });

    expect(mockSendChatMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "mutual-nda",
        history: [],
        user_message: "Hello, I'd like to create a Mutual Non-Disclosure Agreement.",
      })
    );
  });

  it("sends user message and shows AI response", async () => {
    const user = userEvent.setup();
    render(<ChatPanel {...defaultProps} />);

    // Wait for initial greeting
    await waitFor(() => {
      expect(
        screen.getByText("Hello! What is the purpose of this NDA?")
      ).toBeInTheDocument();
    });

    // Set up next response
    mockSendChatMessage.mockResolvedValueOnce({
      assistant_message: "Great! When should this take effect?",
      extracted_fields: { purpose: "Business evaluation" },
    });

    const input = screen.getByPlaceholderText("Type your response...");
    await user.type(input, "To evaluate a business relationship");
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(
        screen.getByText("Great! When should this take effect?")
      ).toBeInTheDocument();
    });

    expect(defaultProps.onFieldsExtracted).toHaveBeenCalledWith({
      purpose: "Business evaluation",
    });
  });

  it("disables input while loading", async () => {
    // Make the API call hang
    mockSendChatMessage.mockReturnValue(new Promise(() => {}));

    render(<ChatPanel {...defaultProps} />);

    // Input should be disabled during initial load
    const input = screen.getByPlaceholderText("Type your response...");
    expect(input).toBeDisabled();
  });
});
