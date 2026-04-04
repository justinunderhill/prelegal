import { z } from "zod";
import { AgreementConfig, FieldDef } from "../templates/types";
import { generateGenericCoverPage } from "../templates/coverPageGenerator";

const dpaSchema = z.object({
  provider_name: z.string(),
  customer_name: z.string(),
  categories_of_personal_data: z.string(),
  categories_of_data_subjects: z.string(),
  special_category_data: z.string(),
  special_category_data_restrictions: z.string(),
  frequency_of_transfer: z.string(),
  nature_and_purpose_of_processing: z.string(),
  duration_of_processing: z.string(),
  approved_subprocessors: z.string(),
  governing_member_state: z.string(),
  security_policy: z.string(),
  provider_security_contact: z.string(),
});

const fields: FieldDef[] = [
  { key: "provider_name", label: "Provider (Processor)", type: "text", placeholder: "e.g., DataCo Inc.", group: "Parties" },
  { key: "customer_name", label: "Customer (Controller)", type: "text", placeholder: "e.g., ClientCorp", group: "Parties" },
  { key: "categories_of_personal_data", label: "Categories of Personal Data", type: "textarea", placeholder: "e.g., Name, email, IP address, usage logs", group: "Processing Details" },
  { key: "categories_of_data_subjects", label: "Categories of Data Subjects", type: "textarea", placeholder: "e.g., End users, employees", group: "Processing Details" },
  { key: "special_category_data", label: "Special Category Data", type: "text", placeholder: "e.g., Health data, or None", group: "Processing Details" },
  { key: "special_category_data_restrictions", label: "Special Category Data Restrictions", type: "textarea", placeholder: "e.g., Encryption at rest and in transit", group: "Processing Details" },
  { key: "frequency_of_transfer", label: "Frequency of Transfer", type: "text", placeholder: "e.g., Continuous, Daily batch", group: "Processing Details" },
  { key: "nature_and_purpose_of_processing", label: "Nature and Purpose of Processing", type: "textarea", placeholder: "e.g., To provide cloud hosting services", group: "Processing Details" },
  { key: "duration_of_processing", label: "Duration of Processing", type: "text", placeholder: "e.g., For the duration of the Agreement", group: "Processing Details" },
  { key: "approved_subprocessors", label: "Approved Subprocessors", type: "textarea", placeholder: "e.g., AWS (US), Datadog (US)", group: "Processing Details" },
  { key: "governing_member_state", label: "Governing Member State", type: "text", placeholder: "e.g., Ireland", group: "Jurisdictional" },
  { key: "security_policy", label: "Security Policy", type: "text", placeholder: "URL or description", group: "Security" },
  { key: "provider_security_contact", label: "Provider Security Contact", type: "text", placeholder: "e.g., security@provider.com", group: "Security" },
];

export const dpaConfig: AgreementConfig = {
  slug: "dpa",
  name: "Data Processing Agreement",
  description: "GDPR and data protection compliance terms covering processing obligations, transfers, security incidents, and audits.",
  coverTemplate: null,
  termsTemplate: "/templates/DPA.md",
  fields,
  schema: dpaSchema,
  buildFieldMap: (values) => {
    const v = values as Record<string, string>;
    return {
      Provider: v.provider_name || "[Provider]",
      Customer: v.customer_name || "[Customer]",
      "Categories of Personal Data": v.categories_of_personal_data || "[Categories of Personal Data]",
      "Categories of Data Subjects": v.categories_of_data_subjects || "[Categories of Data Subjects]",
      "Special Category Data": v.special_category_data || "[Special Category Data]",
      "Special Category Data Restrictions or Safeguards": v.special_category_data_restrictions || "[Special Category Data Restrictions]",
      "Frequency of Transfer": v.frequency_of_transfer || "[Frequency of Transfer]",
      "Nature and Purpose of Processing": v.nature_and_purpose_of_processing || "[Nature and Purpose of Processing]",
      "Duration of Processing": v.duration_of_processing || "[Duration of Processing]",
      "Approved Subprocessors": v.approved_subprocessors || "[Approved Subprocessors]",
      "Governing Member State": v.governing_member_state || "[Governing Member State]",
      "Security Policy": v.security_policy || "[Security Policy]",
      "Provider Security Contact": v.provider_security_contact || "[Provider Security Contact]",
      Agreement: "the Agreement",
    };
  },
  generateCoverPage: (values) => generateGenericCoverPage("Data Processing Agreement", fields, values),
  defaultValues: {
    provider_name: "", customer_name: "", categories_of_personal_data: "",
    categories_of_data_subjects: "", special_category_data: "",
    special_category_data_restrictions: "", frequency_of_transfer: "",
    nature_and_purpose_of_processing: "", duration_of_processing: "",
    approved_subprocessors: "", governing_member_state: "", security_policy: "",
    provider_security_contact: "",
  },
};
