import { z } from "zod";
import { AgreementConfig, FieldDef } from "../templates/types";
import { generateGenericCoverPage } from "../templates/coverPageGenerator";

const aiAddendumSchema = z.object({
  provider_name: z.string(),
  customer_name: z.string(),
  training_data: z.string(),
  training_purposes: z.string(),
  training_restrictions: z.string(),
  improvement_restrictions: z.string(),
});

const fields: FieldDef[] = [
  { key: "provider_name", label: "Provider Name", type: "text", placeholder: "e.g., AI Corp", group: "Parties" },
  { key: "customer_name", label: "Customer Name", type: "text", placeholder: "e.g., Enterprise Inc.", group: "Parties" },
  { key: "training_data", label: "Training Data", type: "textarea", placeholder: "e.g., Customer's anonymized usage data, or None", group: "AI Training Terms" },
  { key: "training_purposes", label: "Training Purposes", type: "textarea", placeholder: "e.g., Improving accuracy of AI Services, or None", group: "AI Training Terms" },
  { key: "training_restrictions", label: "Training Restrictions", type: "textarea", placeholder: "e.g., May not use data to train models for other customers", group: "AI Training Terms" },
  { key: "improvement_restrictions", label: "Improvement Restrictions", type: "textarea", placeholder: "e.g., No restrictions, or No use of Input/Output for improvement", group: "AI Training Terms" },
];

export const aiAddendumConfig: AgreementConfig = {
  slug: "ai-addendum",
  name: "AI Addendum",
  description: "AI-specific provisions covering model training restrictions, input/output ownership, and AI disclaimers.",
  coverTemplate: null,
  termsTemplate: "/templates/AI-Addendum.md",
  fields,
  schema: aiAddendumSchema,
  buildFieldMap: (values) => {
    const v = values as Record<string, string>;
    return {
      Provider: v.provider_name || "[Provider]",
      Customer: v.customer_name || "[Customer]",
      "Training Data": v.training_data || "[Training Data]",
      "Training Purposes": v.training_purposes || "[Training Purposes]",
      "Training Restrictions": v.training_restrictions || "[Training Restrictions]",
      "Improvement Restrictions": v.improvement_restrictions || "[Improvement Restrictions]",
    };
  },
  generateCoverPage: (values) => generateGenericCoverPage("AI Addendum", fields, values),
  defaultValues: {
    provider_name: "", customer_name: "", training_data: "",
    training_purposes: "", training_restrictions: "", improvement_restrictions: "",
  },
};
