import { z } from "zod";
import { AgreementConfig, FieldDef } from "../templates/types";
import { generateGenericCoverPage } from "../templates/coverPageGenerator";

const baaSchema = z.object({
  provider_name: z.string(),
  company_name: z.string(),
  baa_effective_date: z.string(),
  breach_notification_period: z.string(),
  limitations: z.string(),
});

const fields: FieldDef[] = [
  { key: "provider_name", label: "Provider (Business Associate)", type: "text", placeholder: "e.g., HealthTech Inc.", group: "Parties" },
  { key: "company_name", label: "Company (Covered Entity)", type: "text", placeholder: "e.g., Metro Hospital", group: "Parties" },
  { key: "baa_effective_date", label: "BAA Effective Date", type: "date", group: "Terms" },
  { key: "breach_notification_period", label: "Breach Notification Period", type: "text", placeholder: "e.g., 5 business days, 72 hours", group: "Terms" },
  { key: "limitations", label: "Limitations", type: "textarea", placeholder: "e.g., No offshoring of PHI, or None", group: "Terms" },
];

export const baaConfig: AgreementConfig = {
  slug: "baa",
  name: "Business Associate Agreement",
  description: "HIPAA compliance terms covering PHI safeguards, breach notification, subcontractor obligations, and data rights.",
  coverTemplate: null,
  termsTemplate: "/templates/BAA.md",
  fields,
  schema: baaSchema,
  buildFieldMap: (values) => {
    const v = values as Record<string, string>;
    return {
      Provider: v.provider_name || "[Provider]",
      Company: v.company_name || "[Company]",
      "BAA Effective Date": v.baa_effective_date || "[BAA Effective Date]",
      "Breach Notification Period": v.breach_notification_period || "[Breach Notification Period]",
      Limitations: v.limitations || "None",
      Agreement: "the Agreement",
    };
  },
  generateCoverPage: (values) => generateGenericCoverPage("Business Associate Agreement", fields, values),
  defaultValues: {
    provider_name: "", company_name: "", baa_effective_date: "",
    breach_notification_period: "", limitations: "",
  },
};
