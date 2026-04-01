import { PartyValues } from "./types";

/**
 * Escape a string for safe use inside a markdown table cell.
 * Replaces pipe characters and newlines that would break table structure.
 */
function escapeTableCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

/**
 * Replace <span class="coverpage_link">Field Name</span> in standard terms
 * with the corresponding form values.
 */
export function substituteSpanLinks(
  markdown: string,
  fieldMap: Record<string, string>
): string {
  return markdown.replace(
    /<span class="coverpage_link">([^<]+)<\/span>/g,
    (_, fieldName: string) => {
      const value = fieldMap[fieldName];
      return value || `[${fieldName}]`;
    }
  );
}

/**
 * Build the cover page by replacing placeholder values and toggling checkboxes.
 */
export function substituteCoverPage(
  markdown: string,
  values: Record<string, unknown>
): string {
  let result = markdown;

  // Replace [bracketed placeholders] with form values
  const replacements: Record<string, string> = {
    "Evaluating whether to enter into a business relationship with the other party.":
      (values.purpose as string) || "",
    "Today's date": (values.effectiveDate as string) || "",
    "Fill in state": (values.governingLaw as string) || "",
    'Fill in city or county and state, i.e. "courts located in New Castle, DE"':
      (values.jurisdiction as string) || "",
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    if (value) {
      result = result.replaceAll(`[${placeholder}]`, value);
    }
  }

  // Handle MNDA Term radio selection
  const mndaTermType = values.mndaTermType as string;
  const mndaTermYears = values.mndaTermYears as string;
  if (mndaTermType === "fixed") {
    result = result.replace(
      "- [x]     Expires [1 year(s)] from Effective Date.",
      `- [x]     Expires ${mndaTermYears || "1"} year(s) from Effective Date.`
    );
    // Keep "Continues" unchecked
  } else if (mndaTermType === "until_terminated") {
    result = result.replace("- [x]     Expires [1 year(s)]", "- [ ]     Expires [1 year(s)]");
    result = result.replace(
      "- [ ]     Continues until terminated",
      "- [x]     Continues until terminated"
    );
  }

  // Handle Term of Confidentiality radio selection
  const confType = values.confidentialityType as string;
  const confYears = values.confidentialityYears as string;
  if (confType === "fixed") {
    result = result.replace(
      /- \[x\]\s+\[1 year\(s\)\] from Effective Date, but in the case/,
      `- [x]     ${confYears || "1"} year(s) from Effective Date, but in the case`
    );
  } else if (confType === "perpetual") {
    result = result.replace(
      /- \[x\]\s+\[1 year\(s\)\] from Effective Date, but/,
      "- [ ]     [1 year(s)] from Effective Date, but"
    );
    result = result.replace("- [ ]     In perpetuity.", "- [x]     In perpetuity.");
  }

  // Handle MNDA Modifications
  const modifications = values.modifications as string;
  if (modifications) {
    result = result.replace(
      "List any modifications to the MNDA",
      modifications
    );
  }

  // Handle Party details in the signature table
  const party1 = values.party1 as PartyValues | undefined;
  const party2 = values.party2 as PartyValues | undefined;

  if (party1 || party2) {
    const p1 = party1 || { name: "", title: "", company: "", address: "" };
    const p2 = party2 || { name: "", title: "", company: "", address: "" };

    // Replace the signature table (escape values to prevent table breakage)
    const tableLines = [
      "|| PARTY 1 | PARTY 2 |",
      "|:--- | :----: | :----: |",
      `| Signature | ${p1.name ? "_______________" : ""} | ${p2.name ? "_______________" : ""} |`,
      `| Print Name | ${escapeTableCell(p1.name)} | ${escapeTableCell(p2.name)} |`,
      `| Title | ${escapeTableCell(p1.title)} | ${escapeTableCell(p2.title)} |`,
      `| Company | ${escapeTableCell(p1.company)} | ${escapeTableCell(p2.company)} |`,
      `| Notice Address | ${escapeTableCell(p1.address)} | ${escapeTableCell(p2.address)} |`,
      `| Date | ${escapeTableCell((values.effectiveDate as string) || "")} | ${escapeTableCell((values.effectiveDate as string) || "")} |`,
    ];

    result = result.replace(
      /\|\| PARTY 1[\s\S]*?\| Date \|[^\n]*/,
      tableLines.join("\n")
    );
  }

  return result;
}

/**
 * Build the field map for span link substitution from form values.
 */
export function buildFieldMap(values: Record<string, unknown>): Record<string, string> {
  const mndaTermType = values.mndaTermType as string;
  const mndaTermYears = values.mndaTermYears as string;
  const confType = values.confidentialityType as string;
  const confYears = values.confidentialityYears as string;

  let mndaTerm: string;
  if (mndaTermType === "until_terminated") {
    mndaTerm = "until terminated by either party";
  } else {
    mndaTerm = `${mndaTermYears || "1"} year(s) from the Effective Date`;
  }

  let confTerm: string;
  if (confType === "perpetual") {
    confTerm = "perpetuity";
  } else {
    confTerm = `${confYears || "1"} year(s) from the Effective Date`;
  }

  return {
    Purpose: (values.purpose as string) || "[Purpose]",
    "Effective Date": (values.effectiveDate as string) || "[Effective Date]",
    "MNDA Term": mndaTerm,
    "Term of Confidentiality": confTerm,
    "Governing Law": (values.governingLaw as string) || "[Governing Law]",
    Jurisdiction: (values.jurisdiction as string) || "[Jurisdiction]",
  };
}

/**
 * Render the full document by combining cover page and standard terms.
 */
export function renderFullDocument(
  coverTemplate: string,
  termsTemplate: string,
  values: Record<string, unknown>
): string {
  const fieldMap = buildFieldMap(values);
  const cover = substituteCoverPage(coverTemplate, values);
  const terms = substituteSpanLinks(termsTemplate, fieldMap);
  return `${cover}\n\n---\n\n${terms}`;
}
