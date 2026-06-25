"use client";

import { FieldErrors } from "react-hook-form";
import { FieldDef } from "@/lib/templates/types";
import { PartyFields } from "./PartyFields";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface DynamicFormProps {
  fields: FieldDef[];
  register: any;
  setValue: any;
  watch: any;
  errors: FieldErrors;
  groupProgress?: Record<string, { completed: number; total: number }>;
  idPrefix?: string;
}

function groupFields(fields: FieldDef[]): Map<string, FieldDef[]> {
  const groups = new Map<string, FieldDef[]>();
  for (const field of fields) {
    const group = field.group || "General";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(field);
  }
  return groups;
}

const inputStyles =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";

function toSectionId(prefix: string, groupName: string): string {
  return `${prefix}-${groupName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function FieldRenderer({
  field,
  register,
  setValue,
  watch,
  errors,
}: {
  field: FieldDef;
  register: any;
  setValue: any;
  watch: any;
  errors: FieldErrors;
}) {
  const fieldError = errors[field.key] as { message?: string } | undefined;
  const fieldId = `field-${field.key}`;

  switch (field.type) {
    case "text":
      return (
        <div className="space-y-1.5">
          <label
            htmlFor={fieldId}
            className="block text-sm font-semibold text-brand-navy"
          >
            {field.label}
          </label>
          <input
            id={fieldId}
            {...register(field.key)}
            placeholder={field.placeholder}
            aria-invalid={fieldError ? "true" : undefined}
            aria-describedby={fieldError ? `${fieldId}-error` : undefined}
            className={inputStyles}
          />
          {fieldError?.message && (
            <p id={`${fieldId}-error`} role="alert" className="mt-1 text-xs text-red-600">
              {fieldError.message}
            </p>
          )}
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-1.5">
          <label
            htmlFor={fieldId}
            className="block text-sm font-semibold text-brand-navy"
          >
            {field.label}
          </label>
          <textarea
            id={fieldId}
            {...register(field.key)}
            placeholder={field.placeholder}
            rows={3}
            aria-invalid={fieldError ? "true" : undefined}
            aria-describedby={fieldError ? `${fieldId}-error` : undefined}
            className={inputStyles}
          />
          {fieldError?.message && (
            <p id={`${fieldId}-error`} role="alert" className="mt-1 text-xs text-red-600">
              {fieldError.message}
            </p>
          )}
        </div>
      );

    case "date":
      return (
        <div className="space-y-1.5">
          <label
            htmlFor={fieldId}
            className="block text-sm font-semibold text-brand-navy"
          >
            {field.label}
          </label>
          <input
            id={fieldId}
            type="date"
            {...register(field.key)}
            aria-invalid={fieldError ? "true" : undefined}
            aria-describedby={fieldError ? `${fieldId}-error` : undefined}
            className={inputStyles}
          />
          {fieldError?.message && (
            <p id={`${fieldId}-error`} role="alert" className="mt-1 text-xs text-red-600">
              {fieldError.message}
            </p>
          )}
        </div>
      );

    case "radio":
      return (
        <fieldset>
          <legend className="mb-2 block text-sm font-semibold text-brand-navy">
            {field.label}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={field.label}>
            {field.options?.map((option) => (
              <label
                key={option.value}
                className="flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors hover:bg-slate-50 has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue/5"
              >
                <input
                  type="radio"
                  {...register(field.key)}
                  value={option.value}
                  className="text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-slate-700">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );

    case "party":
      return (
        <PartyFields
          partyKey={field.key as "party1" | "party2"}
          label={field.label}
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors[field.key] as any}
        />
      );

    default:
      return null;
  }
}

export function DynamicForm({
  fields,
  register,
  setValue,
  watch,
  errors,
  groupProgress,
  idPrefix = "section",
}: DynamicFormProps) {
  const groups = groupFields(fields);

  return (
    <div className="space-y-5" role="form" aria-label="Agreement form">
      {Array.from(groups.entries()).map(([groupName, groupFields]) => (
        <section
          key={groupName}
          id={toSectionId(idPrefix, groupName)}
          aria-label={groupName}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-floating"
        >
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-semibold text-brand-navy">
                {groupName}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Complete the fields required for this section.
              </p>
            </div>
            {groupProgress?.[groupName] && (
              <span className="shrink-0 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2.5 py-1 text-xs font-semibold text-brand-navy">
                {groupProgress[groupName].completed}/{groupProgress[groupName].total}
              </span>
            )}
          </div>
          <div className="space-y-5">
            {groupFields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
