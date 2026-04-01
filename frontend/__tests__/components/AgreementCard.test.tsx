import { render, screen } from "@testing-library/react";
import { AgreementCard } from "@/components/agreements/AgreementCard";
import { AgreementConfig } from "@/lib/templates/types";
import { z } from "zod";

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

const mockConfig: AgreementConfig = {
  slug: "test-agreement",
  name: "Test Agreement",
  description: "A test agreement for unit testing purposes.",
  coverTemplate: "/templates/test-cover.md",
  termsTemplate: "/templates/test-terms.md",
  fields: [],
  schema: z.object({}),
  defaultValues: {},
};

describe("AgreementCard", () => {
  it("renders the agreement name", () => {
    render(<AgreementCard config={mockConfig} />);
    expect(screen.getByText("Test Agreement")).toBeDefined();
  });

  it("renders the agreement description", () => {
    render(<AgreementCard config={mockConfig} />);
    expect(
      screen.getByText("A test agreement for unit testing purposes.")
    ).toBeDefined();
  });

  it("links to the correct agreement builder page", () => {
    render(<AgreementCard config={mockConfig} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/agreements/test-agreement");
  });

  it("displays the 'Create document' call to action", () => {
    render(<AgreementCard config={mockConfig} />);
    expect(screen.getByText("Create document")).toBeDefined();
  });

  it("renders an SVG icon", () => {
    const { container } = render(<AgreementCard config={mockConfig} />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });
});
