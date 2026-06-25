import { z } from "zod";
import { analyzeDocumentReview } from "@/lib/review";
import { AgreementConfig } from "@/lib/templates/types";

const config: AgreementConfig = {
  slug: "test",
  name: "Test Agreement",
  description: "Test agreement",
  coverTemplate: null,
  termsTemplate: "/templates/test.md",
  schema: z.object({}),
  defaultValues: {},
  fields: [
    { key: "effectiveDate", label: "Effective Date", type: "date", group: "Agreement Details" },
    {
      key: "termType",
      label: "Term Type",
      type: "radio",
      group: "Legal Terms",
      options: [
        { label: "Fixed term", value: "fixed" },
        { label: "Until terminated", value: "until_terminated" },
      ],
    },
    { key: "party1", label: "Party 1", type: "party", group: "Parties" },
  ],
  buildFieldMap: () => ({}),
};

describe("analyzeDocumentReview", () => {
  it("reports missing fields and incomplete parties", () => {
    const review = analyzeDocumentReview({
      config,
      values: {
        effectiveDate: "",
        termType: "fixed",
        party1: { name: "Ava", title: "", company: "Acme", address: "1 Road" },
      },
      renderedMarkdown: "Agreement text",
    });

    expect(review.readyToExport).toBe(false);
    expect(review.missingFields.map((issue) => issue.label)).toEqual([
      "Effective Date",
      "Party 1",
    ]);
  });

  it("reports unresolved bracketed placeholders in rendered markdown", () => {
    const review = analyzeDocumentReview({
      config,
      values: {
        effectiveDate: "2026-06-25",
        termType: "fixed",
        party1: { name: "Ava", title: "CEO", company: "Acme", address: "1 Road" },
      },
      renderedMarkdown: "This Agreement uses [Governing Law] and [Jurisdiction].",
    });

    expect(review.readyToExport).toBe(false);
    expect(review.unresolvedPlaceholders.map((issue) => issue.label)).toEqual([
      "Governing Law",
      "Jurisdiction",
    ]);
  });

  it("returns key selections using option labels", () => {
    const review = analyzeDocumentReview({
      config,
      values: {
        effectiveDate: "2026-06-25",
        termType: "until_terminated",
        party1: { name: "Ava", title: "CEO", company: "Acme", address: "1 Road" },
      },
      renderedMarkdown: "Agreement text",
    });

    expect(review.readyToExport).toBe(true);
    expect(review.keySelections).toEqual([
      { label: "Effective Date", value: "2026-06-25" },
      { label: "Term Type", value: "Until terminated" },
    ]);
  });
});
