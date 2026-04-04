import { z } from "zod";
import { AgreementConfig, FieldDef } from "../templates/types";
import { substituteMutualNdaCoverPage, buildMutualNdaFieldMap } from "../templates/engine";

const partySchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  address: z.string().min(1, "Address is required"),
  signature: z.string(),
});

export const mutualNdaSchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  mndaTermType: z.enum(["fixed", "until_terminated"]),
  mndaTermYears: z.string(),
  confidentialityType: z.enum(["fixed", "perpetual"]),
  confidentialityYears: z.string(),
  governingLaw: z.string().min(1, "Governing law is required"),
  jurisdiction: z.string().min(1, "Jurisdiction is required"),
  modifications: z.string(),
  party1: partySchema,
  party2: partySchema,
});

export type MutualNdaFormValues = z.infer<typeof mutualNdaSchema>;

const fields: FieldDef[] = [
  {
    key: "purpose",
    label: "Purpose",
    type: "textarea",
    placeholder: "Evaluating whether to enter into a business relationship with the other party.",
    defaultValue:
      "Evaluating whether to enter into a business relationship with the other party.",
    group: "Agreement Details",
  },
  {
    key: "effectiveDate",
    label: "Effective Date",
    type: "date",
    group: "Agreement Details",
  },
  {
    key: "mndaTermType",
    label: "MNDA Term",
    type: "radio",
    options: [
      { label: "Expires after fixed period", value: "fixed" },
      { label: "Continues until terminated", value: "until_terminated" },
    ],
    defaultValue: "fixed",
    group: "Agreement Details",
  },
  {
    key: "mndaTermYears",
    label: "MNDA Term (years)",
    type: "text",
    placeholder: "1",
    defaultValue: "1",
    group: "Agreement Details",
  },
  {
    key: "confidentialityType",
    label: "Term of Confidentiality",
    type: "radio",
    options: [
      { label: "Fixed period (trade secrets protected indefinitely)", value: "fixed" },
      { label: "In perpetuity", value: "perpetual" },
    ],
    defaultValue: "fixed",
    group: "Agreement Details",
  },
  {
    key: "confidentialityYears",
    label: "Confidentiality Term (years)",
    type: "text",
    placeholder: "1",
    defaultValue: "1",
    group: "Agreement Details",
  },
  {
    key: "governingLaw",
    label: "Governing Law (State)",
    type: "text",
    placeholder: "e.g., Delaware",
    group: "Legal Terms",
  },
  {
    key: "jurisdiction",
    label: "Jurisdiction",
    type: "text",
    placeholder: 'e.g., "courts located in New Castle, DE"',
    group: "Legal Terms",
  },
  {
    key: "modifications",
    label: "MNDA Modifications",
    type: "textarea",
    placeholder: "List any modifications to the standard MNDA terms...",
    group: "Legal Terms",
  },
  {
    key: "party1",
    label: "Party 1",
    type: "party",
    group: "Parties",
  },
  {
    key: "party2",
    label: "Party 2",
    type: "party",
    group: "Parties",
  },
];

const today = new Date().toISOString().split("T")[0];

export const mutualNdaConfig: AgreementConfig = {
  slug: "mutual-nda",
  name: "Mutual Non-Disclosure Agreement",
  description:
    "Common Paper Mutual NDA covering confidentiality obligations, permitted disclosures, and protections for shared confidential information between two parties.",
  coverTemplate: "/templates/Mutual-NDA-coverpage.md",
  termsTemplate: "/templates/Mutual-NDA.md",
  fields,
  schema: mutualNdaSchema,
  buildFieldMap: buildMutualNdaFieldMap,
  generateCoverPage: (values, rawTemplate) => {
    if (!rawTemplate) return "";
    return substituteMutualNdaCoverPage(rawTemplate, values);
  },
  defaultValues: {
    purpose:
      "Evaluating whether to enter into a business relationship with the other party.",
    effectiveDate: today,
    mndaTermType: "fixed",
    mndaTermYears: "1",
    confidentialityType: "fixed",
    confidentialityYears: "1",
    governingLaw: "",
    jurisdiction: "",
    modifications: "",
    party1: { name: "", title: "", company: "", address: "", signature: "" },
    party2: { name: "", title: "", company: "", address: "", signature: "" },
  },
};
