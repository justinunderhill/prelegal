import { z } from "zod";
import { AgreementConfig, FieldDef } from "../templates/types";
import { generateGenericCoverPage } from "../templates/coverPageGenerator";

const softwareLicenseSchema = z.object({
  provider_name: z.string(),
  customer_name: z.string(),
  effective_date: z.string(),
  governing_law: z.string(),
  general_cap_amount: z.string(),
  increased_cap_amount: z.string(),
  increased_claims: z.string(),
  unlimited_claims: z.string(),
  provider_covered_claims: z.string(),
  customer_covered_claims: z.string(),
  order_date: z.string(),
  subscription_period: z.string(),
  non_renewal_notice_date: z.string(),
  license_limits: z.string(),
  payment_process: z.string(),
  warranty_period: z.string(),
  deletion_procedure: z.string(),
});

const fields: FieldDef[] = [
  { key: "provider_name", label: "Provider Name", type: "text", placeholder: "e.g., SoftCo Inc.", group: "Parties" },
  { key: "customer_name", label: "Customer Name", type: "text", placeholder: "e.g., Enterprise Corp", group: "Parties" },
  { key: "effective_date", label: "Effective Date", type: "date", group: "Key Terms" },
  { key: "governing_law", label: "Governing Law", type: "text", placeholder: "e.g., Delaware", group: "Key Terms" },
  { key: "order_date", label: "Order Date", type: "date", group: "Order Form" },
  { key: "subscription_period", label: "Subscription Period", type: "text", placeholder: "e.g., 1 year, Perpetual", group: "Order Form" },
  { key: "non_renewal_notice_date", label: "Non-Renewal Notice Date", type: "text", placeholder: "e.g., 30 days before end", group: "Order Form" },
  { key: "license_limits", label: "License Limits", type: "text", placeholder: "e.g., 50 seats, Single server", group: "Order Form" },
  { key: "payment_process", label: "Payment Process", type: "text", placeholder: "e.g., Annual prepaid", group: "Order Form" },
  { key: "warranty_period", label: "Warranty Period", type: "text", placeholder: "e.g., 90 days from delivery", group: "Order Form" },
  { key: "deletion_procedure", label: "Deletion Procedure", type: "textarea", placeholder: "e.g., Uninstall and certify within 30 days", group: "Order Form" },
  { key: "general_cap_amount", label: "General Cap Amount", type: "text", group: "Legal Terms" },
  { key: "increased_cap_amount", label: "Increased Cap Amount", type: "text", group: "Legal Terms" },
  { key: "increased_claims", label: "Increased Claims", type: "textarea", group: "Legal Terms" },
  { key: "unlimited_claims", label: "Unlimited Claims", type: "textarea", group: "Legal Terms" },
  { key: "provider_covered_claims", label: "Provider Covered Claims", type: "textarea", group: "Legal Terms" },
  { key: "customer_covered_claims", label: "Customer Covered Claims", type: "textarea", group: "Legal Terms" },
];

export const softwareLicenseConfig: AgreementConfig = {
  slug: "software-license",
  name: "Software License Agreement",
  description: "On-premise or installable software terms covering licensing, restrictions, payment, and warranties.",
  coverTemplate: null,
  termsTemplate: "/templates/Software-License-Agreement.md",
  fields,
  schema: softwareLicenseSchema,
  buildFieldMap: (values) => {
    const v = values as Record<string, string>;
    return {
      Provider: v.provider_name || "[Provider]",
      Customer: v.customer_name || "[Customer]",
      "Effective Date": v.effective_date || "[Effective Date]",
      "Governing Law": v.governing_law || "[Governing Law]",
      "General Cap Amount": v.general_cap_amount || "[General Cap Amount]",
      "Increased Cap Amount": v.increased_cap_amount || "[Increased Cap Amount]",
      "Increased Claims": v.increased_claims || "[Increased Claims]",
      "Unlimited Claims": v.unlimited_claims || "[Unlimited Claims]",
      "Provider Covered Claim": v.provider_covered_claims || "[Provider Covered Claims]",
      "Provider Covered Claims": v.provider_covered_claims || "[Provider Covered Claims]",
      "Customer Covered Claim": v.customer_covered_claims || "[Customer Covered Claims]",
      "Customer Covered Claims": v.customer_covered_claims || "[Customer Covered Claims]",
      "Order Date": v.order_date || "[Order Date]",
      "Subscription Period": v.subscription_period || "[Subscription Period]",
      "Non-Renewal Notice Date": v.non_renewal_notice_date || "[Non-Renewal Notice Date]",
      "License Limits": v.license_limits || "[License Limits]",
      "Payment Process": v.payment_process || "[Payment Process]",
      "Warranty Period": v.warranty_period || "[Warranty Period]",
      "Deletion Procedure": v.deletion_procedure || "[Deletion Procedure]",
      "Permitted Uses": v.license_limits || "[Permitted Uses]",
    };
  },
  generateCoverPage: (values) => generateGenericCoverPage("Software License Agreement", fields, values),
  defaultValues: {
    provider_name: "", customer_name: "", effective_date: "", governing_law: "",
    general_cap_amount: "", increased_cap_amount: "", increased_claims: "",
    unlimited_claims: "", provider_covered_claims: "", customer_covered_claims: "",
    order_date: "", subscription_period: "", non_renewal_notice_date: "",
    license_limits: "", payment_process: "", warranty_period: "", deletion_procedure: "",
  },
};
