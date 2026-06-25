import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/contexts/AuthContext";

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

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

function renderWithAuth(ui: React.ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe("AppShell", () => {
  it("renders the PreLegal branding", () => {
    renderWithAuth(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    expect(screen.getByText("PreLegal")).toBeDefined();
  });

  it("renders the primary navigation links", () => {
    renderWithAuth(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    const templatesLink = screen.getByText("Templates");
    const documentsLink = screen.getByText("Documents");
    expect(templatesLink.closest("a")?.getAttribute("href")).toBe("/agreements");
    expect(documentsLink.closest("a")?.getAttribute("href")).toBe("/documents");
  });

  it("renders children content", () => {
    renderWithAuth(
      <AppShell>
        <div>Test child content</div>
      </AppShell>
    );
    expect(screen.getByText("Test child content")).toBeDefined();
  });

  it("has a home link on the logo", () => {
    renderWithAuth(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    const logoLink = screen.getByText("PreLegal").closest("a");
    expect(logoLink?.getAttribute("href")).toBe("/");
  });

  it("renders a header and main section", () => {
    const { container } = renderWithAuth(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    expect(container.querySelector("header")).toBeTruthy();
    expect(container.querySelector("main")).toBeTruthy();
  });
});
