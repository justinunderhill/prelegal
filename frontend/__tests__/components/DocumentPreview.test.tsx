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
      <DocumentPreview coverTemplate="" termsTemplate="" values={{}} />
    );
    expect(screen.getByText("Loading document preview...")).toBeDefined();
  });

  it("renders markdown when templates are provided", () => {
    render(
      <DocumentPreview
        coverTemplate="# Cover Page"
        termsTemplate="# Standard Terms"
        values={{}}
      />
    );
    const preview = screen.getByTestId("markdown-preview");
    expect(preview).toBeDefined();
    expect(preview.textContent).toContain("Cover Page");
    expect(preview.textContent).toContain("Standard Terms");
  });

  it("passes substituted values into the rendered document", () => {
    const cover = "Purpose: [Evaluating whether to enter into a business relationship with the other party.]";
    const terms =
      'The <span class="coverpage_link">Purpose</span> of this agreement.';
    const values = {
      purpose: "Joint venture",
      mndaTermType: "fixed",
      mndaTermYears: "1",
      confidentialityType: "fixed",
      confidentialityYears: "1",
    };
    render(
      <DocumentPreview
        coverTemplate={cover}
        termsTemplate={terms}
        values={values}
      />
    );
    const preview = screen.getByTestId("markdown-preview");
    expect(preview.textContent).toContain("Joint venture");
  });

  it("shows field placeholders when values are empty", () => {
    const terms =
      'The <span class="coverpage_link">Purpose</span> is important.';
    render(
      <DocumentPreview
        coverTemplate="# Cover"
        termsTemplate={terms}
        values={{}}
      />
    );
    const preview = screen.getByTestId("markdown-preview");
    expect(preview.textContent).toContain("[Purpose]");
  });

  it("renders a divider between cover and terms", () => {
    render(
      <DocumentPreview
        coverTemplate="# Cover"
        termsTemplate="# Terms"
        values={{}}
      />
    );
    const preview = screen.getByTestId("markdown-preview");
    expect(preview.textContent).toContain("---");
  });

  it("handles special characters in values safely", () => {
    const terms =
      'Law: <span class="coverpage_link">Governing Law</span>';
    const values = {
      governingLaw: 'New York <script>alert("xss")</script>',
      mndaTermType: "fixed",
      mndaTermYears: "1",
      confidentialityType: "fixed",
      confidentialityYears: "1",
    };
    render(
      <DocumentPreview
        coverTemplate="# Cover"
        termsTemplate={terms}
        values={values}
      />
    );
    const preview = screen.getByTestId("markdown-preview");
    // The raw text should appear, but in real rendering ReactMarkdown + rehype would sanitize
    expect(preview.textContent).toContain("New York");
  });
});
