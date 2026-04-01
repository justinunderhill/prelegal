import { z } from "zod";

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "select"
  | "radio"
  | "signature"
  | "party";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: FieldOption[];
  defaultValue?: unknown;
  group?: string;
}

export interface PartyValues {
  name: string;
  title: string;
  company: string;
  address: string;
  signature: string;
}

export interface AgreementConfig {
  slug: string;
  name: string;
  description: string;
  coverTemplate: string;
  termsTemplate: string;
  fields: FieldDef[];
  schema: z.ZodType;
  defaultValues: Record<string, unknown>;
}
