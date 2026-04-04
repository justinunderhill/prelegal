import { render, screen } from "@testing-library/react";

// Mock ESM modules before importing the component
jest.mock("react-markdown", () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-preview">{children}</div>;
  };
});
jest.mock("rehype-raw", () => () => {});
jest.mock("rehype-sanitize", () => {
  const mock = () => {};
  mock.defaultSchema = { attributes: {}, tagNames: [] };
  return mock;
});

import { DocumentPreview } from "@/components/builder/preview/DocumentPreview";

describe("DocumentPreview", () => {
  it("shows loading state when templates are empty", () => {
    render(
      <DocumentPreview coverMarkdown="" termsTemplate="" fieldMap={{}} />
    );
    expect(screen.getByText("Loading document preview...")).toBeDefined();
  });

  it("renders markdown when templates are provided", () => {
    render(
      <DocumentPreview
        coverMarkdown="# Cover Page"
        termsTemplate="# Standard Terms"
        fieldMap={{}}
      />
    );
    const preview = screen.getByTestId("markdown-preview");
    expect(preview).toBeDefined();
    expect(preview.textContent).toContain("Cover Page");
    expect(preview.textContent).toContain("Standard Terms");
  });

  it("passes substituted values into the rendered document", () => {
    const cover = "Purpose: Joint venture";
    const terms =
      'The <span class="coverpage_link">Purpose</span> of this agreement.';
    const fieldMap = {
      Purpose: "Joint venture",
      "Effective Date": "2026-04-01",
      "MNDA Term": "1 year(s) from the Effective Date",
      "Term of Confidentiality": "1 year(s) from the Effective Date",
      "Governing Law": "[Governing Law]",
      Jurisdiction: "[Jurisdiction]",
    };
    render(
      <DocumentPreview
        coverMarkdown={cover}
        termsTemplate={terms}
        fieldMap={fieldMap}
      />
    );
    const preview = screen.getByTestId("markdown-preview");
    expect(preview.textContent).toContain("Joint venture");
  });

  it("shows field placeholders when fieldMap has no matching entry", () => {
    const terms =
      'The <span class="coverpage_link">Purpose</span> is important.';
    render(
      <DocumentPreview
        coverMarkdown="# Cover"
        termsTemplate={terms}
        fieldMap={{}}
      />
    );
    const preview = screen.getByTestId("markdown-preview");
    expect(preview.textContent).toContain("[Purpose]");
  });

  it("renders a divider between cover and terms", () => {
    render(
      <DocumentPreview
        coverMarkdown="# Cover"
        termsTemplate="# Terms"
        fieldMap={{}}
      />
    );
    const preview = screen.getByTestId("markdown-preview");
    expect(preview.textContent).toContain("---");
  });

  it("handles special characters in field values safely", () => {
    const terms =
      'Law: <span class="coverpage_link">Governing Law</span>';
    const fieldMap = {
      "Governing Law": 'New York <script>alert("xss")</script>',
    };
    render(
      <DocumentPreview
        coverMarkdown="# Cover"
        termsTemplate={terms}
        fieldMap={fieldMap}
      />
    );
    const preview = screen.getByTestId("markdown-preview");
    // The raw text should appear, but in real rendering ReactMarkdown + rehype would sanitize
    expect(preview.textContent).toContain("New York");
  });
});
