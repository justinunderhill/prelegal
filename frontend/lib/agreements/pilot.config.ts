import { z } from "zod";
import { AgreementConfig, FieldDef } from "../templates/types";
import { generateGenericCoverPage } from "../templates/coverPageGenerator";

const pilotSchema = z.object({
  provider_name: z.string(),
  customer_name: z.string(),
  effective_date: z.string(),
  pilot_period: z.string(),
  governing_law: z.string(),
  chosen_courts: z.string(),
  general_cap_amount: z.string(),
  notice_address: z.string(),
});

const fields: FieldDef[] = [
  { key: "provider_name", label: "Provider Name", type: "text", placeholder: "e.g., SaaS Inc.", group: "Parties" },
  { key: "customer_name", label: "Customer Name", type: "text", placeholder: "e.g., Evaluator Corp", group: "Parties" },
  { key: "effective_date", label: "Effective Date", type: "date", group: "Terms" },
  { key: "pilot_period", label: "Pilot Period", type: "text", placeholder: "e.g., 30 days, 90 days from Effective Date", group: "Terms" },
  { key: "governing_law", label: "Governing Law", type: "text", placeholder: "e.g., California", group: "Legal Terms" },
  { key: "chosen_courts", label: "Chosen Courts", type: "text", placeholder: "e.g., courts in San Francisco, CA", group: "Legal Terms" },
  { key: "general_cap_amount", label: "General Cap Amount", type: "text", placeholder: "e.g., $50,000", group: "Legal Terms" },
  { key: "notice_address", label: "Notice Address", type: "text", placeholder: "Email or postal address (optional)", group: "Legal Terms" },
];

export const pilotConfig: AgreementConfig = {
  slug: "pilot",
  name: "Pilot Agreement",
  description: "Product trial and evaluation periods covering pilot access, restrictions, disclaimers, and liability.",
  coverTemplate: null,
  termsTemplate: "/templates/Pilot-Agreement.md",
  fields,
  schema: pilotSchema,
  buildFieldMap: (values) => {
    const v = values as Record<string, string>;
    return {
      Provider: v.provider_name || "[Provider]",
      Customer: v.customer_name || "[Customer]",
      "Effective Date": v.effective_date || "[Effective Date]",
      "Pilot Period": v.pilot_period || "[Pilot Period]",
      "Governing Law": v.governing_law || "[Governing Law]",
      "Chosen Courts": v.chosen_courts || "[Chosen Courts]",
      "General Cap Amount": v.general_cap_amount || "[General Cap Amount]",
      "Notice Address": v.notice_address || "[Notice Address]",
    };
  },
  generateCoverPage: (values) => generateGenericCoverPage("Pilot Agreement", fields, values),
  defaultValues: {
    provider_name: "", customer_name: "", effective_date: "", pilot_period: "",
    governing_law: "", chosen_courts: "", general_cap_amount: "", notice_address: "",
  },
};
