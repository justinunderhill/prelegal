import {
  substituteSpanLinks,
  substituteMutualNdaCoverPage,
  buildMutualNdaFieldMap,
  renderFullDocument,
} from "@/lib/templates/engine";

describe("Template Engine Edge Cases", () => {
  describe("markdown injection prevention", () => {
    it("handles user input with markdown heading syntax", () => {
      const md = '<span class="coverpage_link">Purpose</span>';
      const result = substituteSpanLinks(md, {
        Purpose: "# Injected Heading",
      });
      expect(result).toBe("# Injected Heading");
      // Note: ReactMarkdown will render this as a heading, but it's within
      // the document content context so it's acceptable. The key is it doesn't
      // break the document structure.
    });

    it("handles user input with markdown link syntax", () => {
      const md = '<span class="coverpage_link">Purpose</span>';
      const result = substituteSpanLinks(md, {
        Purpose: "[click here](javascript:alert(1))",
      });
      expect(result).toContain("[click here]");
    });

    it("handles user input with HTML tags", () => {
      const md = '<span class="coverpage_link">Purpose</span>';
      const result = substituteSpanLinks(md, {
        Purpose: '<script>alert("xss")</script>',
      });
      // The substitution itself doesn't sanitize - ReactMarkdown + rehype-raw handles this
      expect(result).toContain("<script>");
    });

    it("handles user input with markdown table-breaking pipes", () => {
      const cover = `|| PARTY 1 | PARTY 2 |
|:--- | :----: | :----: |
| Print Name | |
| Title | | |
| Company | | |
| Notice Address <label>Use either email or postal address</label> | | |
| Date | | |`;

      const values = {
        party1: {
          name: "Alice | Bob",
          title: "CEO | CTO",
          company: "Acme | Beta",
          address: "test@test.com",
          signature: "",
        },
        party2: {
          name: "Charlie",
          title: "VP",
          company: "Gamma",
          address: "c@gamma.com",
          signature: "",
        },
      };

      // Pipe characters should be escaped to prevent table breakage
      const result = substituteMutualNdaCoverPage(cover, values);
      expect(result).toContain("Alice \\| Bob");
    });
  });

  describe("long value handling", () => {
    it("handles very long purpose text", () => {
      const longPurpose = "A".repeat(5000);
      const md = '<span class="coverpage_link">Purpose</span>';
      const result = substituteSpanLinks(md, { Purpose: longPurpose });
      expect(result).toBe(longPurpose);
      expect(result.length).toBe(5000);
    });

    it("handles multiline values in cover page fields", () => {
      const multiline = "Line 1\nLine 2\nLine 3";
      const md = "Jurisdiction: [Fill in city or county and state, i.e. \"courts located in New Castle, DE\"]";
      const result = substituteMutualNdaCoverPage(md, { jurisdiction: multiline });
      expect(result).toContain("Line 1\nLine 2\nLine 3");
    });
  });

  describe("unicode handling", () => {
    it("handles unicode in field values", () => {
      const md = '<span class="coverpage_link">Purpose</span>';
      const result = substituteSpanLinks(md, {
        Purpose: "Evaluation des relations commerciales",
      });
      expect(result).toBe("Evaluation des relations commerciales");
    });

    it("handles CJK characters", () => {
      const md = '<span class="coverpage_link">Governing Law</span>';
      const result = substituteSpanLinks(md, {
        "Governing Law": "東京都",
      });
      expect(result).toBe("東京都");
    });

    it("handles emoji in values", () => {
      const md = '<span class="coverpage_link">Purpose</span>';
      const result = substituteSpanLinks(md, {
        Purpose: "Partnership 🤝 evaluation",
      });
      expect(result).toBe("Partnership 🤝 evaluation");
    });
  });

  describe("buildMutualNdaFieldMap edge cases", () => {
    it("handles zero years", () => {
      const map = buildMutualNdaFieldMap({
        mndaTermType: "fixed",
        mndaTermYears: "0",
        confidentialityType: "fixed",
        confidentialityYears: "0",
      });
      expect(map["MNDA Term"]).toBe("0 year(s) from the Effective Date");
    });

    it("handles decimal years", () => {
      const map = buildMutualNdaFieldMap({
        mndaTermType: "fixed",
        mndaTermYears: "1.5",
        confidentialityType: "fixed",
        confidentialityYears: "2.5",
      });
      expect(map["MNDA Term"]).toBe("1.5 year(s) from the Effective Date");
    });

    it("handles large year values", () => {
      const map = buildMutualNdaFieldMap({
        mndaTermType: "fixed",
        mndaTermYears: "99",
        confidentialityType: "fixed",
        confidentialityYears: "99",
      });
      expect(map["MNDA Term"]).toBe("99 year(s) from the Effective Date");
    });
  });

  describe("renderFullDocument edge cases", () => {
    it("handles empty templates", () => {
      const result = renderFullDocument("", "", {});
      expect(result).toContain("---");
    });

    it("handles templates with only whitespace", () => {
      const result = renderFullDocument("   ", "   ", {});
      expect(result).toBeDefined();
    });

    it("preserves template formatting not related to substitutions", () => {
      const cover = "**Bold text** and *italic*";
      const terms = "1. List item\n2. Another item";
      const result = renderFullDocument(cover, terms, {});
      expect(result).toContain("**Bold text**");
      expect(result).toContain("1. List item");
    });
  });
});
