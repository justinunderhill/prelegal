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
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";

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
        <div>
          <label
            htmlFor={fieldId}
            className="mb-1 block text-sm font-medium text-gray-700"
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
        <div>
          <label
            htmlFor={fieldId}
            className="mb-1 block text-sm font-medium text-gray-700"
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
        <div>
          <label
            htmlFor={fieldId}
            className="mb-1 block text-sm font-medium text-gray-700"
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
          <legend className="mb-2 block text-sm font-medium text-gray-700">
            {field.label}
          </legend>
          <div className="space-y-2" role="radiogroup" aria-label={field.label}>
            {field.options?.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm transition-colors hover:bg-gray-50 has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue/5"
              >
                <input
                  type="radio"
                  {...register(field.key)}
                  value={option.value}
                  className="text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-gray-700">{option.label}</span>
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
}: DynamicFormProps) {
  const groups = groupFields(fields);

  return (
    <div className="space-y-8" role="form" aria-label="Agreement form">
      {Array.from(groups.entries()).map(([groupName, groupFields]) => (
        <section key={groupName} aria-label={groupName}>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-gray">
            {groupName}
          </h3>
          <div className="space-y-4">
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
