import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModeToggle } from "@/components/builder/ModeToggle";

describe("ModeToggle", () => {
  it("renders both mode buttons", () => {
    render(<ModeToggle mode="chat" onChange={jest.fn()} />);
    expect(screen.getByText("AI Chat")).toBeInTheDocument();
    expect(screen.getByText("Manual Form")).toBeInTheDocument();
  });

  it("calls onChange with 'form' when clicking Manual Form", async () => {
    const onChange = jest.fn();
    render(<ModeToggle mode="chat" onChange={onChange} />);

    await userEvent.setup().click(screen.getByText("Manual Form"));
    expect(onChange).toHaveBeenCalledWith("form");
  });

  it("calls onChange with 'chat' when clicking AI Chat", async () => {
    const onChange = jest.fn();
    render(<ModeToggle mode="form" onChange={onChange} />);

    await userEvent.setup().click(screen.getByText("AI Chat"));
    expect(onChange).toHaveBeenCalledWith("chat");
  });
});
