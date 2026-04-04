import { z } from "zod";
import { AgreementConfig, FieldDef } from "../templates/types";
import { generateGenericCoverPage } from "../templates/coverPageGenerator";

const slaSchema = z.object({
  provider_name: z.string(),
  customer_name: z.string(),
  target_uptime: z.string(),
  target_response_time: z.string(),
  support_channel: z.string(),
  subscription_period: z.string(),
  scheduled_downtime: z.string(),
  uptime_credit: z.string(),
  response_time_credit: z.string(),
});

const fields: FieldDef[] = [
  { key: "provider_name", label: "Provider Name", type: "text", placeholder: "e.g., CloudCo", group: "Parties" },
  { key: "customer_name", label: "Customer Name", type: "text", placeholder: "e.g., ClientCorp", group: "Parties" },
  { key: "target_uptime", label: "Target Uptime", type: "text", placeholder: "e.g., 99.9%", group: "Service Levels" },
  { key: "target_response_time", label: "Target Response Time", type: "text", placeholder: "e.g., 4 business hours", group: "Service Levels" },
  { key: "support_channel", label: "Support Channel", type: "text", placeholder: "e.g., support@example.com", group: "Service Levels" },
  { key: "subscription_period", label: "Subscription Period", type: "text", placeholder: "e.g., 1 year", group: "Terms" },
  { key: "scheduled_downtime", label: "Scheduled Downtime", type: "textarea", placeholder: "e.g., Sundays 2-4am ET with 48 hours notice", group: "Terms" },
  { key: "uptime_credit", label: "Uptime Credit", type: "textarea", placeholder: "e.g., 2% of monthly fees per 0.1% below Target Uptime", group: "Credits" },
  { key: "response_time_credit", label: "Response Time Credit", type: "textarea", placeholder: "e.g., 1% of monthly fees per missed response", group: "Credits" },
];

export const slaConfig: AgreementConfig = {
  slug: "sla",
  name: "Service Level Agreement",
  description: "Uptime targets, response time commitments, service credit remedies, and termination rights for cloud services.",
  coverTemplate: null,
  termsTemplate: "/templates/SLA.md",
  fields,
  schema: slaSchema,
  buildFieldMap: (values) => {
    const v = values as Record<string, string>;
    return {
      Provider: v.provider_name || "[Provider]",
      Customer: v.customer_name || "[Customer]",
      "Target Uptime": v.target_uptime || "[Target Uptime]",
      "Target Response Time": v.target_response_time || "[Target Response Time]",
      "Support Channel": v.support_channel || "[Support Channel]",
      "Subscription Period": v.subscription_period || "[Subscription Period]",
      "Scheduled Downtime": v.scheduled_downtime || "[Scheduled Downtime]",
      "Uptime Credit": v.uptime_credit || "[Uptime Credit]",
      "Response Time Credit": v.response_time_credit || "[Response Time Credit]",
    };
  },
  generateCoverPage: (values) => generateGenericCoverPage("Service Level Agreement", fields, values),
  defaultValues: {
    provider_name: "", customer_name: "", target_uptime: "", target_response_time: "",
    support_channel: "", subscription_period: "", scheduled_downtime: "",
    uptime_credit: "", response_time_credit: "",
  },
};
