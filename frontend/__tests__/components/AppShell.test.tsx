import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/layout/AppShell";

// Mock Next.js Link
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("AppShell", () => {
  it("renders the PreLegal branding", () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    expect(screen.getByText("PreLegal")).toBeDefined();
  });

  it("renders the Agreements navigation link", () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    const link = screen.getByText("Agreements");
    expect(link).toBeDefined();
    expect(link.closest("a")?.getAttribute("href")).toBe("/agreements");
  });

  it("renders children content", () => {
    render(
      <AppShell>
        <div>Test child content</div>
      </AppShell>
    );
    expect(screen.getByText("Test child content")).toBeDefined();
  });

  it("has a home link on the logo", () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    const logoLink = screen.getByText("PreLegal").closest("a");
    expect(logoLink?.getAttribute("href")).toBe("/");
  });

  it("renders a header and main section", () => {
    const { container } = render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    expect(container.querySelector("header")).toBeTruthy();
    expect(container.querySelector("main")).toBeTruthy();
  });
});
