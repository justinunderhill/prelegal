import { AgreementConfig, FieldDef } from "./templates/types";

const FIELD_ALIASES: Record<string, string[]> = {
  effectiveDate: ["effective_date"],
  governingLaw: ["governing_law"],
  provider_name: ["party1_name", "party1_company"],
  customer_name: ["party2_name", "party2_company"],
};

const PARTY_KEYS = ["name", "title", "company", "address", "signature"];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getIncomingValue(
  field: FieldDef,
  extractedFields: Record<string, unknown>
): unknown {
  if (field.key in extractedFields) return extractedFields[field.key];

  for (const alias of FIELD_ALIASES[field.key] ?? []) {
    const value = extractedFields[alias];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return undefined;
}

function mergePartyValue(
  existingValue: unknown,
  incomingValue: unknown
): Record<string, unknown> {
  const existing = isPlainObject(existingValue) ? existingValue : {};
  const incoming = isPlainObject(incomingValue) ? incomingValue : {};

  return PARTY_KEYS.reduce<Record<string, unknown>>((party, key) => {
    party[key] = incoming[key] ?? existing[key] ?? "";
    return party;
  }, {});
}

export function buildPrefilledDraftValues(
  config: AgreementConfig,
  extractedFields: Record<string, unknown>
): Record<string, unknown> {
  const values: Record<string, unknown> = { ...config.defaultValues };

  for (const field of config.fields) {
    const incomingValue = getIncomingValue(field, extractedFields);
    if (incomingValue === undefined || incomingValue === null) continue;

    if (field.type === "party") {
      values[field.key] = mergePartyValue(values[field.key], incomingValue);
    } else if (String(incomingValue).trim() !== "") {
      values[field.key] = incomingValue;
    }
  }

  return values;
}

export function countPrefillFields(
  config: AgreementConfig,
  extractedFields: Record<string, unknown>
): number {
  return config.fields.filter((field) => getIncomingValue(field, extractedFields) !== undefined).length;
}
