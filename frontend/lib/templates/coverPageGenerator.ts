import { FieldDef } from "./types";

/**
 * Escape a string for safe use inside a markdown table cell.
 */
function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

/**
 * Generate a generic cover page from an agreement's field definitions and values.
 * Used for all agreements except Mutual NDA (which has a custom cover page template).
 */
export function generateGenericCoverPage(
  agreementName: string,
  fields: FieldDef[],
  values: Record<string, unknown>
): string {
  const lines: string[] = [];
  lines.push(`# ${agreementName}`);
  lines.push("");
  lines.push("## Cover Page");
  lines.push("");

  // Group fields
  const groups = new Map<string, FieldDef[]>();
  for (const field of fields) {
    if (field.type === "party" || field.type === "signature") continue;
    const group = field.group || "General";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(field);
  }

  // Render grouped fields as tables
  for (const [groupName, groupFields] of groups) {
    lines.push(`### ${groupName}`);
    lines.push("");
    lines.push("| Field | Value |");
    lines.push("|:---|:---|");
    for (const field of groupFields) {
      const raw = values[field.key];
      const value = raw != null && raw !== "" ? String(raw) : "[TBD]";
      lines.push(`| ${escapeCell(field.label)} | ${escapeCell(value)} |`);
    }
    lines.push("");
  }

  // Render party fields
  const partyFields = fields.filter((f) => f.type === "party");
  if (partyFields.length > 0) {
    lines.push("### Parties");
    lines.push("");

    const partyLabels = partyFields.map((f) => f.label);
    const partyValues = partyFields.map(
      (f) => (values[f.key] as Record<string, string>) || {}
    );

    const headerCells = partyLabels.map(escapeCell).join(" | ");
    lines.push(`|| ${headerCells} |`);
    lines.push(`|:--- | ${partyLabels.map(() => ":----:").join(" | ")} |`);

    for (const row of ["name", "title", "company", "address"] as const) {
      const label = row.charAt(0).toUpperCase() + row.slice(1);
      const cells = partyValues
        .map((p) => escapeCell(p[row] || ""))
        .join(" | ");
      if (row === "name") {
        const sigCells = partyValues
          .map((p) => (p.name ? "_______________" : ""))
          .join(" | ");
        lines.push(`| Signature | ${sigCells} |`);
      }
      lines.push(`| ${label} | ${cells} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
