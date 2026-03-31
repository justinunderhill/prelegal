"use client";

import { SignaturePad } from "./SignaturePad";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PartyFieldsProps {
  partyKey: "party1" | "party2";
  label: string;
  register: any;
  setValue: any;
  watch: any;
  errors?: Record<string, { message?: string }>;
}

export function PartyFields({
  partyKey,
  label,
  register,
  setValue,
  watch,
  errors,
}: PartyFieldsProps) {
  const signatureValue = String(watch(`${partyKey}.signature`) ?? "");

  return (
    <fieldset className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
      <legend className="px-2 text-sm font-semibold text-slate-800">{label}</legend>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            {...register(`${partyKey}.name`)}
            placeholder="John Smith"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          {errors?.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
          <input
            {...register(`${partyKey}.title`)}
            placeholder="CEO"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          {errors?.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Company</label>
        <input
          {...register(`${partyKey}.company`)}
          placeholder="Acme Corp"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
        {errors?.company && (
          <p className="mt-1 text-xs text-red-600">{errors.company.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Notice Address
        </label>
        <input
          {...register(`${partyKey}.address`)}
          placeholder="email@company.com or postal address"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
        {errors?.address && (
          <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
        )}
      </div>

      <SignaturePad
        label="Signature"
        value={signatureValue}
        onChange={(dataUrl) => setValue(`${partyKey}.signature`, dataUrl)}
      />
    </fieldset>
  );
}
