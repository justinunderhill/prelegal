import { z } from "zod";
import { AgreementConfig, FieldDef } from "../templates/types";
import { generateGenericCoverPage } from "../templates/coverPageGenerator";

const designPartnerSchema = z.object({
  provider_name: z.string(),
  partner_name: z.string(),
  effective_date: z.string(),
  term: z.string(),
  program: z.string(),
  fees: z.string(),
  governing_law: z.string(),
  chosen_courts: z.string(),
  notice_address: z.string(),
});

const fields: FieldDef[] = [
  { key: "provider_name", label: "Provider Name", type: "text", placeholder: "e.g., TechStartup Inc.", group: "Parties" },
  { key: "partner_name", label: "Partner Name", type: "text", placeholder: "e.g., Early Adopter Co.", group: "Parties" },
  { key: "effective_date", label: "Effective Date", type: "date", group: "Key Terms" },
  { key: "term", label: "Term", type: "text", placeholder: "e.g., 6 months", group: "Key Terms" },
  { key: "program", label: "Program Description", type: "textarea", placeholder: "e.g., Beta testing of analytics platform with monthly feedback sessions", group: "Key Terms" },
  { key: "fees", label: "Fees", type: "text", placeholder: "e.g., None, or $500/month", group: "Key Terms" },
  { key: "governing_law", label: "Governing Law", type: "text", placeholder: "e.g., California", group: "Legal Terms" },
  { key: "chosen_courts", label: "Chosen Courts", type: "text", placeholder: "e.g., courts in San Francisco, CA", group: "Legal Terms" },
  { key: "notice_address", label: "Notice Address", type: "text", placeholder: "Email or postal address", group: "Legal Terms" },
];

export const designPartnerConfig: AgreementConfig = {
  slug: "design-partner",
  name: "Design Partner Agreement",
  description: "Early-access product partnerships covering product access, feedback obligations, confidentiality, and IP.",
  coverTemplate: null,
  termsTemplate: "/templates/Design-Partner-Agreement.md",
  fields,
  schema: designPartnerSchema,
  buildFieldMap: (values) => {
    const v = values as Record<string, string>;
    return {
      Provider: v.provider_name || "[Provider]",
      Partner: v.partner_name || "[Partner]",
      "Effective Date": v.effective_date || "[Effective Date]",
      Term: v.term || "[Term]",
      Program: v.program || "[Program]",
      Fees: v.fees || "None",
      "Governing Law": v.governing_law || "[Governing Law]",
      "Chosen Courts": v.chosen_courts || "[Chosen Courts]",
      "Notice Address": v.notice_address || "[Notice Address]",
    };
  },
  generateCoverPage: (values) => generateGenericCoverPage("Design Partner Agreement", fields, values),
  defaultValues: {
    provider_name: "", partner_name: "", effective_date: "", term: "",
    program: "", fees: "", governing_law: "", chosen_courts: "", notice_address: "",
  },
};
