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

  switch (field.type) {
    case "text":
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {field.label}
          </label>
          <input
            {...register(field.key)}
            placeholder={field.placeholder}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          {fieldError?.message && (
            <p className="mt-1 text-xs text-red-600">{fieldError.message}</p>
          )}
        </div>
      );

    case "textarea":
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {field.label}
          </label>
          <textarea
            {...register(field.key)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          {fieldError?.message && (
            <p className="mt-1 text-xs text-red-600">{fieldError.message}</p>
          )}
        </div>
      );

    case "date":
      return (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {field.label}
          </label>
          <input
            type="date"
            {...register(field.key)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          {fieldError?.message && (
            <p className="mt-1 text-xs text-red-600">{fieldError.message}</p>
          )}
        </div>
      );

    case "radio":
      return (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {field.label}
          </label>
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm transition-colors hover:bg-slate-50 has-[:checked]:border-slate-400 has-[:checked]:bg-slate-50"
              >
                <input
                  type="radio"
                  {...register(field.key)}
                  value={option.value}
                  className="text-slate-900 focus:ring-slate-500"
                />
                <span className="text-slate-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
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
    <div className="space-y-8">
      {Array.from(groups.entries()).map(([groupName, groupFields]) => (
        <div key={groupName}>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
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
        </div>
      ))}
    </div>
  );
}
