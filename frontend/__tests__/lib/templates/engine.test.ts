import {
  substituteSpanLinks,
  substituteMutualNdaCoverPage,
  buildMutualNdaFieldMap,
  renderFullDocument,
} from "@/lib/templates/engine";

describe("substituteSpanLinks", () => {
  it("replaces a single span link with the corresponding value", () => {
    const md = 'The <span class="coverpage_link">Purpose</span> of this agreement.';
    const result = substituteSpanLinks(md, { Purpose: "Business evaluation" });
    expect(result).toBe("The Business evaluation of this agreement.");
  });

  it("replaces multiple different span links", () => {
    const md =
      '<span class="coverpage_link">Purpose</span> and <span class="coverpage_link">Effective Date</span>';
    const result = substituteSpanLinks(md, {
      Purpose: "Collaboration",
      "Effective Date": "2026-04-01",
    });
    expect(result).toBe("Collaboration and 2026-04-01");
  });

  it("replaces multiple occurrences of the same span link", () => {
    const md =
      '<span class="coverpage_link">Governing Law</span> applies. See <span class="coverpage_link">Governing Law</span>.';
    const result = substituteSpanLinks(md, { "Governing Law": "Delaware" });
    expect(result).toBe("Delaware applies. See Delaware.");
  });

  it("uses placeholder fallback when field is not in the map", () => {
    const md = '<span class="coverpage_link">Missing Field</span>';
    const result = substituteSpanLinks(md, {});
    expect(result).toBe("[Missing Field]");
  });

  it("does not modify non-coverpage spans", () => {
    const md = '<span class="other_class">Something</span>';
    const result = substituteSpanLinks(md, { Something: "replaced" });
    expect(result).toBe('<span class="other_class">Something</span>');
  });

  it("handles empty string values", () => {
    const md = '<span class="coverpage_link">Purpose</span>';
    const result = substituteSpanLinks(md, { Purpose: "" });
    expect(result).toBe("[Purpose]");
  });

  it("handles special regex characters in field values", () => {
    const md = '<span class="coverpage_link">Purpose</span>';
    const result = substituteSpanLinks(md, {
      Purpose: "Evaluate $100 deal (phase 1)",
    });
    expect(result).toBe("Evaluate $100 deal (phase 1)");
  });

  it("returns unchanged markdown when no spans are present", () => {
    const md = "Plain text with no spans.";
    const result = substituteSpanLinks(md, { Purpose: "anything" });
    expect(result).toBe("Plain text with no spans.");
  });
});

describe("substituteMutualNdaCoverPage", () => {
  // Load the actual cover page template
  const coverTemplate = `# Mutual Non-Disclosure Agreement

## USING THIS MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "MNDA") consists of: (1) this Cover Page ("**Cover Page**") and (2) the Common Paper Mutual NDA Standard Terms Version 1.0 ("**Standard Terms**") identical to those posted at [commonpaper.com/standards/mutual-nda/1.0](https://commonpaper.com/standards/mutual-nda/1.0). Any modifications of the Standard Terms should be made on the Cover Page, which will control over conflicts with the Standard Terms.

### Purpose
<label>How Confidential Information may be used</label>

[Evaluating whether to enter into a business relationship with the other party.]

### Effective Date
[Today's date]

### MNDA Term
<label>The length of this MNDA</label>
- [x]     Expires [1 year(s)] from Effective Date.
- [ ]     Continues until terminated in accordance with the terms of the MNDA.

### Term of Confidentiality
<label>How long Confidential Information is protected</label>
- [x]     [1 year(s)] from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.
- [ ]     In perpetuity.

### Governing Law & Jurisdiction
Governing Law: [Fill in state]

Jurisdiction: [Fill in city or county and state, i.e. "courts located in New Castle, DE"]

### MNDA Modifications
List any modifications to the MNDA

By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.

|| PARTY 1 | PARTY 2 |
|:--- | :----: | :----: |
| Signature | | |
| Print Name | |
| Title | | |
| Company | | |
| Notice Address <label>Use either email or postal address</label> | | |
| Date | | |

Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).`;

  const defaultValues = {
    purpose:
      "Evaluating whether to enter into a business relationship with the other party.",
    effectiveDate: "2026-04-01",
    mndaTermType: "fixed",
    mndaTermYears: "2",
    confidentialityType: "fixed",
    confidentialityYears: "3",
    governingLaw: "Delaware",
    jurisdiction: "courts located in New Castle, DE",
    modifications: "",
    party1: {
      name: "Alice Smith",
      title: "CEO",
      company: "Acme Corp",
      address: "alice@acme.com",
      signature: "",
    },
    party2: {
      name: "Bob Jones",
      title: "CTO",
      company: "Beta Inc",
      address: "bob@beta.com",
      signature: "",
    },
  };

  it("substitutes the effective date", () => {
    const result = substituteMutualNdaCoverPage(coverTemplate, defaultValues);
    expect(result).toContain("2026-04-01");
    expect(result).not.toContain("[Today's date]");
  });

  it("substitutes governing law", () => {
    const result = substituteMutualNdaCoverPage(coverTemplate, defaultValues);
    expect(result).toContain("Governing Law: Delaware");
    expect(result).not.toContain("[Fill in state]");
  });

  it("substitutes jurisdiction", () => {
    const result = substituteMutualNdaCoverPage(coverTemplate, defaultValues);
    expect(result).toContain("Jurisdiction: courts located in New Castle, DE");
  });

  it("replaces MNDA term years when type is fixed", () => {
    const result = substituteMutualNdaCoverPage(coverTemplate, defaultValues);
    expect(result).toContain("Expires 2 year(s) from Effective Date.");
  });

  it("toggles checkboxes when MNDA term is until_terminated", () => {
    const values = { ...defaultValues, mndaTermType: "until_terminated" };
    const result = substituteMutualNdaCoverPage(coverTemplate, values);
    expect(result).toContain("- [x]     Continues until terminated");
    expect(result).toMatch(/- \[ \]\s+Expires/);
  });

  it("replaces confidentiality years when type is fixed", () => {
    const result = substituteMutualNdaCoverPage(coverTemplate, defaultValues);
    expect(result).toContain("3 year(s) from Effective Date, but in the case");
  });

  it("toggles checkboxes when confidentiality is perpetual", () => {
    const values = { ...defaultValues, confidentialityType: "perpetual" };
    const result = substituteMutualNdaCoverPage(coverTemplate, values);
    expect(result).toContain("- [x]     In perpetuity.");
  });

  it("substitutes party names in the signature table", () => {
    const result = substituteMutualNdaCoverPage(coverTemplate, defaultValues);
    expect(result).toContain("Alice Smith");
    expect(result).toContain("Bob Jones");
  });

  it("substitutes party titles in the signature table", () => {
    const result = substituteMutualNdaCoverPage(coverTemplate, defaultValues);
    expect(result).toContain("CEO");
    expect(result).toContain("CTO");
  });

  it("substitutes party companies in the signature table", () => {
    const result = substituteMutualNdaCoverPage(coverTemplate, defaultValues);
    expect(result).toContain("Acme Corp");
    expect(result).toContain("Beta Inc");
  });

  it("substitutes party addresses in the signature table", () => {
    const result = substituteMutualNdaCoverPage(coverTemplate, defaultValues);
    expect(result).toContain("alice@acme.com");
    expect(result).toContain("bob@beta.com");
  });

  it("substitutes modifications text", () => {
    const values = {
      ...defaultValues,
      modifications: "Section 5 is deleted in its entirety.",
    };
    const result = substituteMutualNdaCoverPage(coverTemplate, values);
    expect(result).toContain("Section 5 is deleted in its entirety.");
    expect(result).not.toContain("List any modifications to the MNDA");
  });

  it("handles empty party objects gracefully", () => {
    const values = {
      ...defaultValues,
      party1: { name: "", title: "", company: "", address: "", signature: "" },
      party2: undefined,
    };
    const result = substituteMutualNdaCoverPage(coverTemplate, values);
    // Should not throw
    expect(result).toBeDefined();
  });

  it("preserves the purpose default when same value provided", () => {
    const result = substituteMutualNdaCoverPage(coverTemplate, defaultValues);
    // The default purpose is the same as the placeholder, so it should appear once
    expect(result).toContain(
      "Evaluating whether to enter into a business relationship with the other party."
    );
  });

  it("handles special characters in field values", () => {
    const values = {
      ...defaultValues,
      governingLaw: "New York (NY)",
      jurisdiction: 'courts located in Manhattan, NY "Southern District"',
    };
    const result = substituteMutualNdaCoverPage(coverTemplate, values);
    expect(result).toContain("New York (NY)");
    expect(result).toContain(
      'courts located in Manhattan, NY "Southern District"'
    );
  });
});

describe("buildMutualNdaFieldMap", () => {
  it("maps fixed MNDA term with custom years", () => {
    const values = {
      purpose: "Testing",
      effectiveDate: "2026-01-01",
      mndaTermType: "fixed",
      mndaTermYears: "3",
      confidentialityType: "fixed",
      confidentialityYears: "5",
      governingLaw: "California",
      jurisdiction: "San Francisco, CA",
    };
    const map = buildMutualNdaFieldMap(values);
    expect(map.Purpose).toBe("Testing");
    expect(map["Effective Date"]).toBe("2026-01-01");
    expect(map["MNDA Term"]).toBe("3 year(s) from the Effective Date");
    expect(map["Term of Confidentiality"]).toBe(
      "5 year(s) from the Effective Date"
    );
    expect(map["Governing Law"]).toBe("California");
    expect(map.Jurisdiction).toBe("San Francisco, CA");
  });

  it("maps until_terminated MNDA term", () => {
    const values = {
      mndaTermType: "until_terminated",
      mndaTermYears: "1",
      confidentialityType: "fixed",
      confidentialityYears: "1",
    };
    const map = buildMutualNdaFieldMap(values);
    expect(map["MNDA Term"]).toBe("until terminated by either party");
  });

  it("maps perpetual confidentiality", () => {
    const values = {
      mndaTermType: "fixed",
      mndaTermYears: "1",
      confidentialityType: "perpetual",
      confidentialityYears: "1",
    };
    const map = buildMutualNdaFieldMap(values);
    expect(map["Term of Confidentiality"]).toBe("perpetuity");
  });

  it("uses placeholder fallbacks for empty values", () => {
    const map = buildMutualNdaFieldMap({});
    expect(map.Purpose).toBe("[Purpose]");
    expect(map["Effective Date"]).toBe("[Effective Date]");
    expect(map["Governing Law"]).toBe("[Governing Law]");
    expect(map.Jurisdiction).toBe("[Jurisdiction]");
  });

  it("defaults to 1 year when years are not specified", () => {
    const values = {
      mndaTermType: "fixed",
      confidentialityType: "fixed",
    };
    const map = buildMutualNdaFieldMap(values);
    expect(map["MNDA Term"]).toBe("1 year(s) from the Effective Date");
    expect(map["Term of Confidentiality"]).toBe(
      "1 year(s) from the Effective Date"
    );
  });
});

describe("renderFullDocument", () => {
  it("renders both cover page and standard terms separated by divider", () => {
    const coverMarkdown = "# Cover Page\nPurpose: Joint venture evaluation\nDate: 2026-06-15\nLaw: Texas";
    const termsTemplate = `# Standard Terms
Purpose: <span class="coverpage_link">Purpose</span>
Date: <span class="coverpage_link">Effective Date</span>
Law: <span class="coverpage_link">Governing Law</span>`;
    const fieldMap = {
      Purpose: "Joint venture evaluation",
      "Effective Date": "2026-06-15",
      "Governing Law": "Texas",
    };

    const result = renderFullDocument(coverMarkdown, termsTemplate, fieldMap);

    // Cover page content
    expect(result).toContain("Purpose: Joint venture evaluation");
    expect(result).toContain("Date: 2026-06-15");
    expect(result).toContain("Law: Texas");

    // Divider
    expect(result).toContain("---");

    // Standard terms substitutions
    expect(result).toContain("Purpose: Joint venture evaluation");
    expect(result).toContain("Date: 2026-06-15");
    expect(result).toContain("Law: Texas");
  });

  it("keeps placeholders when fieldMap has no matching entry", () => {
    const coverMarkdown = "# Cover";
    const termsTemplate = `<span class="coverpage_link">Purpose</span> <span class="coverpage_link">Effective Date</span> <span class="coverpage_link">Governing Law</span>`;
    const result = renderFullDocument(coverMarkdown, termsTemplate, {});
    expect(result).toContain("[Purpose]");
    expect(result).toContain("[Effective Date]");
    expect(result).toContain("[Governing Law]");
  });
});
