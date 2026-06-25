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

const inputStyles =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";

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
    <fieldset className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
      <legend className="px-2 text-sm font-semibold text-brand-navy">{label}</legend>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${partyKey}-name`}
            className="mb-1.5 block text-sm font-semibold text-brand-navy"
          >
            Full Name
          </label>
          <input
            id={`${partyKey}-name`}
            {...register(`${partyKey}.name`)}
            placeholder="John Smith"
            aria-invalid={errors?.name ? "true" : undefined}
            className={inputStyles}
          />
          {errors?.name && (
            <p role="alert" className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor={`${partyKey}-title`}
            className="mb-1.5 block text-sm font-semibold text-brand-navy"
          >
            Title
          </label>
          <input
            id={`${partyKey}-title`}
            {...register(`${partyKey}.title`)}
            placeholder="CEO"
            aria-invalid={errors?.title ? "true" : undefined}
            className={inputStyles}
          />
          {errors?.title && (
            <p role="alert" className="mt-1 text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor={`${partyKey}-company`}
          className="mb-1.5 block text-sm font-semibold text-brand-navy"
        >
          Company
        </label>
        <input
          id={`${partyKey}-company`}
          {...register(`${partyKey}.company`)}
          placeholder="Acme Corp"
          aria-invalid={errors?.company ? "true" : undefined}
          className={inputStyles}
        />
        {errors?.company && (
          <p role="alert" className="mt-1 text-xs text-red-600">{errors.company.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor={`${partyKey}-address`}
          className="mb-1.5 block text-sm font-semibold text-brand-navy"
        >
          Notice Address
        </label>
        <input
          id={`${partyKey}-address`}
          {...register(`${partyKey}.address`)}
          placeholder="email@company.com or postal address"
          aria-invalid={errors?.address ? "true" : undefined}
          className={inputStyles}
        />
        {errors?.address && (
          <p role="alert" className="mt-1 text-xs text-red-600">{errors.address.message}</p>
        )}
      </div>

      <SignaturePad
        label={`${label} Signature`}
        value={signatureValue}
        onChange={(dataUrl) => setValue(`${partyKey}.signature`, dataUrl)}
      />
    </fieldset>
  );
}
