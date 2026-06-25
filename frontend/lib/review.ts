import { AgreementConfig, FieldDef } from "./templates/types";

export interface ReviewIssue {
  id: string;
  label: string;
  detail: string;
  severity: "required" | "warning";
}

export interface KeySelection {
  label: string;
  value: string;
}

export interface DocumentReview {
  missingFields: ReviewIssue[];
  unresolvedPlaceholders: ReviewIssue[];
  keySelections: KeySelection[];
  readyToExport: boolean;
}

const KEY_FIELD_PATTERN =
  /(term|law|jurisdiction|liability|confidentiality|security|processing|transfer|renewal|subprocessor|effective|duration|modification|restriction)/i;

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || String(value).trim() === "";
}

function displayValue(value: unknown): string {
  if (isBlank(value)) return "Not set";
  return String(value);
}

function isFieldComplete(field: FieldDef, values: Record<string, unknown>): boolean {
  const value = values[field.key];

  if (field.type === "party") {
    if (!value || typeof value !== "object") return false;
    const party = value as Record<string, unknown>;
    return ["name", "title", "company", "address"].every((key) => !isBlank(party[key]));
  }

  return !isBlank(value);
}

function getMissingFields(
  fields: FieldDef[],
  values: Record<string, unknown>
): ReviewIssue[] {
  return fields
    .filter((field) => !isFieldComplete(field, values))
    .map((field) => ({
      id: `missing-${field.key}`,
      label: field.label,
      detail: `${field.group || "General"} needs ${field.label.toLowerCase()}.`,
      severity: "required" as const,
    }));
}

function getUnresolvedPlaceholders(renderedMarkdown: string): ReviewIssue[] {
  const placeholders = new Set<string>();
  const matches = renderedMarkdown.matchAll(/\[([^\]\n]{2,80})\]/g);

  for (const match of matches) {
    const value = match[1].trim();
    if (!value || value.toLowerCase() === "x") continue;
    if (/^\d+\s+year\(s\)$/i.test(value)) continue;
    placeholders.add(value);
  }

  return Array.from(placeholders)
    .slice(0, 8)
    .map((placeholder) => ({
      id: `placeholder-${placeholder}`,
      label: placeholder,
      detail: `The rendered document still contains [${placeholder}].`,
      severity: "warning" as const,
    }));
}

function getOptionLabel(field: FieldDef, value: unknown): string {
  const option = field.options?.find((item) => item.value === value);
  return option?.label ?? displayValue(value);
}

function getKeySelections(
  fields: FieldDef[],
  values: Record<string, unknown>
): KeySelection[] {
  return fields
    .filter((field) => field.type !== "party" && KEY_FIELD_PATTERN.test(`${field.key} ${field.label}`))
    .filter((field) => !isBlank(values[field.key]))
    .slice(0, 6)
    .map((field) => ({
      label: field.label,
      value: getOptionLabel(field, values[field.key]),
    }));
}

export function analyzeDocumentReview({
  config,
  values,
  renderedMarkdown,
}: {
  config: AgreementConfig;
  values: Record<string, unknown>;
  renderedMarkdown: string;
}): DocumentReview {
  const missingFields = getMissingFields(config.fields, values);
  const unresolvedPlaceholders = getUnresolvedPlaceholders(renderedMarkdown);

  return {
    missingFields,
    unresolvedPlaceholders,
    keySelections: getKeySelections(config.fields, values),
    readyToExport: missingFields.length === 0 && unresolvedPlaceholders.length === 0,
  };
}
