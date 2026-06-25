"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgreementConfig, FieldDef } from "@/lib/templates/types";
import { DynamicForm } from "./form/DynamicForm";
import { DocumentPreview } from "./preview/DocumentPreview";
import { useTemplates } from "@/lib/hooks/useTemplates";
import { generateAndDownloadPdf } from "@/lib/pdf/generatePdf";
import { getDraft, removeDraft, saveDraft } from "@/lib/drafts";
import { recordExport } from "@/lib/exportHistory";
import { analyzeDocumentReview } from "@/lib/review";
import { renderFullDocument } from "@/lib/templates/engine";

interface BuilderLayoutProps {
  config: AgreementConfig;
}

type GroupProgress = Record<string, { completed: number; total: number }>;

function toSectionId(prefix: string, groupName: string): string {
  return `${prefix}-${groupName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || String(value).trim() === "";
}

function isFieldComplete(field: FieldDef, values: Record<string, unknown>): boolean {
  const value = values[field.key];

  if (field.type === "party") {
    if (!value || typeof value !== "object") return false;
    const party = value as Record<string, unknown>;
    return ["name", "title", "company", "address"].every((key) => !isBlank(party[key]));
  }

  if (field.type === "radio" || field.type === "select") {
    return !isBlank(value);
  }

  if (field.type === "signature") {
    return !isBlank(value);
  }

  return !isBlank(value);
}

function getGroupProgress(fields: FieldDef[], values: Record<string, unknown>): GroupProgress {
  return fields.reduce<GroupProgress>((progress, field) => {
    const group = field.group || "General";
    if (!progress[group]) progress[group] = { completed: 0, total: 0 };
    progress[group].total += 1;
    if (isFieldComplete(field, values)) progress[group].completed += 1;
    return progress;
  }, {});
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export function BuilderLayout({ config }: BuilderLayoutProps) {
  const {
    register,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(config.schema as any),
    defaultValues: config.defaultValues,
    mode: "onChange",
  });

  const values = watch() as Record<string, unknown>;
  const valuesJson = useMemo(() => safeStringify(values), [values]);
  const defaultValuesJson = useMemo(
    () => safeStringify(config.defaultValues),
    [config.defaultValues]
  );
  const [downloading, setDownloading] = useState(false);
  const { coverTemplate, termsTemplate, error: templateError } = useTemplates(
    config.coverTemplate,
    config.termsTemplate
  );
  const templatesLoaded = Boolean(
    (config.coverTemplate ? coverTemplate : true) && termsTemplate
  );

  // Build cover markdown: use fetched template for NDA, or generate for others
  const coverMarkdown = useMemo(() => {
    if (config.generateCoverPage) {
      return config.generateCoverPage(values, coverTemplate || undefined);
    }
    return coverTemplate || "";
  }, [config, coverTemplate, values]);

  // Build the field map for span substitution
  const fieldMap = useMemo(() => config.buildFieldMap(values), [config, values]);
  const renderedMarkdown = useMemo(() => {
    if (!termsTemplate) return "";
    return renderFullDocument(coverMarkdown, termsTemplate, fieldMap);
  }, [coverMarkdown, fieldMap, termsTemplate]);
  const review = useMemo(
    () =>
      analyzeDocumentReview({
        config,
        values,
        renderedMarkdown,
      }),
    [config, renderedMarkdown, values]
  );

  const groupProgress = useMemo(
    () => getGroupProgress(config.fields, values),
    [config.fields, values]
  );
  const groupEntries = Object.entries(groupProgress);
  const totalFields = groupEntries.reduce((sum, [, group]) => sum + group.total, 0);
  const completedFields = groupEntries.reduce((sum, [, group]) => sum + group.completed, 0);
  const completionPercent = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  const requiredIssues = totalFields - completedFields;
  const statusLabel = requiredIssues === 0 ? "Ready for review" : "Draft in progress";

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      await generateAndDownloadPdf(config, values, termsTemplate);
      recordExport({ slug: config.slug, agreementName: config.name });
    } finally {
      setDownloading(false);
    }
  }, [config, values, termsTemplate]);

  const handleClear = useCallback(() => {
    if (window.confirm("Clear all fields and start this document over?")) {
      removeDraft(config.slug);
      reset(config.defaultValues);
    }
  }, [reset, config.defaultValues, config.slug]);

  useEffect(() => {
    const draft = getDraft(config.slug);
    if (draft) {
      reset(draft.values);
    }
  }, [config.slug, reset]);

  useEffect(() => {
    if (!valuesJson || valuesJson === defaultValuesJson) return;

    const parsedValues = JSON.parse(valuesJson) as Record<string, unknown>;
    saveDraft({
      slug: config.slug,
      agreementName: config.name,
      values: parsedValues,
    });
  }, [config.name, config.slug, defaultValuesJson, valuesJson]);

  // Toolbar: navigate back to the catalog or reset the current document.
  const builderToolbar = (
    <div className="flex items-center justify-between gap-3">
      <Link
        href="/agreements"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-brand-navy"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to menu
      </Link>
      <button
        type="button"
        onClick={handleClear}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-500 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        Clear form
      </button>
    </div>
  );

  const downloadButton = (
    <button
      onClick={handleDownload}
      disabled={downloading || !templatesLoaded}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-purple/25 transition-all hover:bg-[#66317d] hover:shadow-lg hover:shadow-brand-purple/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand-purple"
    >
      {downloading ? (
        <>
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Generating...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </>
      )}
    </button>
  );

  const reviewPanel = (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-floating">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pre-export review
          </p>
          <h3 className="mt-1 text-base font-semibold text-brand-navy">
            {review.readyToExport ? "Ready to export" : "Needs attention"}
          </h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            review.readyToExport
              ? "border border-brand-blue/20 bg-brand-blue/10 text-brand-navy"
              : "border border-brand-yellow/30 bg-brand-yellow/10 text-brand-navy"
          }`}
        >
          {review.readyToExport ? "Clear" : `${review.missingFields.length + review.unresolvedPlaceholders.length} item(s)`}
        </span>
      </div>

      {review.missingFields.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-brand-navy">Missing guided fields</p>
          <div className="mt-2 space-y-2">
            {review.missingFields.slice(0, 4).map((issue) => (
              <div key={issue.id} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-sm font-semibold text-brand-navy">{issue.label}</p>
                <p className="mt-0.5 text-xs text-slate-600">{issue.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {review.unresolvedPlaceholders.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-brand-navy">Unresolved document text</p>
          <div className="mt-2 space-y-2">
            {review.unresolvedPlaceholders.slice(0, 4).map((issue) => (
              <div key={issue.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-sm font-semibold text-brand-navy">{issue.label}</p>
                <p className="mt-0.5 text-xs text-slate-600">{issue.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {review.keySelections.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-brand-navy">Key selections</p>
          <div className="mt-2 grid gap-2">
            {review.keySelections.map((selection) => (
              <div key={selection.label} className="flex justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-500">{selection.label}</span>
                <span className="max-w-44 truncate text-right font-semibold text-brand-navy">
                  {selection.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {review.readyToExport && (
        <p className="mt-4 rounded-lg border border-brand-blue/20 bg-brand-blue/10 px-3 py-2 text-sm text-brand-navy">
          No missing guided fields or bracketed placeholders were detected.
        </p>
      )}
    </div>
  );

  const progressPanel = (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-floating">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Completion
          </p>
          <p className="mt-1 text-sm font-semibold text-brand-navy">{statusLabel}</p>
        </div>
        <span className="text-2xl font-bold text-brand-navy">{completionPercent}%</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-blue transition-all duration-300"
          style={{ width: `${completionPercent}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-slate-500">
        {requiredIssues === 0
          ? "All guided sections have enough information for review."
          : `${requiredIssues} section ${requiredIssues === 1 ? "item" : "items"} still need attention.`}
      </p>
    </div>
  );

  const sectionChecklist = (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-floating">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Draft sections
      </p>
      <div className="mt-3 space-y-2">
        {groupEntries.map(([groupName, progress]) => {
          const complete = progress.completed === progress.total;
          return (
            <a
              key={groupName}
              href={`#${toSectionId("desktop-builder", groupName)}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm transition-colors hover:border-brand-blue/30 hover:bg-brand-blue/5"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.65rem] font-bold ${
                    complete
                      ? "border-brand-blue bg-brand-blue text-white"
                      : "border-slate-300 bg-white text-slate-500"
                  }`}
                >
                  {complete ? "✓" : progress.completed}
                </span>
                <span className="truncate font-medium text-brand-navy">{groupName}</span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-slate-500">
                {progress.completed}/{progress.total}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );

  const previewContent = templateError ? (
    <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
      <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
      <p className="text-sm font-medium text-red-600">Failed to load document templates</p>
      <p className="text-xs text-brand-gray">{templateError}</p>
    </div>
  ) : (
    <DocumentPreview coverMarkdown={coverMarkdown} termsTemplate={termsTemplate} fieldMap={fieldMap} />
  );

  return (
    <>
      {/* Mobile: stacked layout, natural scroll */}
      <div className="flex flex-col bg-slate-50 lg:hidden">
        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          {builderToolbar}
          <div className="mt-4">
            <span className="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-navy">
              {statusLabel}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Local autosave
            </span>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-brand-navy">{config.name}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">Complete the guided sections and review the live document preview.</p>
          </div>
          <div className="mt-4">{progressPanel}</div>
        </div>
        <div className="px-4 py-6 sm:px-6">
          <DynamicForm
            fields={config.fields}
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
            groupProgress={groupProgress}
            idPrefix="mobile-builder"
          />
        </div>
        <div className="px-4 pb-6 sm:px-6">{reviewPanel}</div>
        <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-navy">Preview</h2>
            {downloadButton}
          </div>
        </div>
        <div className="px-4 pb-8 sm:px-6">
          <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-floating sm:p-8">
            {previewContent}
          </div>
        </div>
      </div>

      {/* Desktop: side-by-side with independent scroll */}
      <div className="hidden flex-col bg-slate-50 lg:flex" style={{ height: "calc(100vh - 4rem)" }}>
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
            <div className="min-w-0">
              {builderToolbar}
              <div className="mt-3 flex items-center gap-3">
                <h1 className="truncate text-xl font-bold tracking-tight text-brand-navy">
                  {config.name}
                </h1>
                <span className="shrink-0 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-navy">
                  {statusLabel}
                </span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Local autosave
                </span>
              </div>
            </div>
            <div className="flex min-w-80 items-center gap-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Draft completion</span>
                  <span>{completionPercent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-blue transition-all duration-300"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
              {downloadButton}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 lg:flex">
          {/* Left: Form */}
          <div className="flex w-[46%] overflow-hidden border-r border-slate-200 bg-slate-50" role="region" aria-label="Agreement form">
            <aside className="w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-4">
              {progressPanel}
              <div className="mt-4">{sectionChecklist}</div>
              <div className="mt-4">{reviewPanel}</div>
            </aside>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <DynamicForm
                fields={config.fields}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                groupProgress={groupProgress}
                idPrefix="desktop-builder"
              />
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex w-[54%] flex-col bg-slate-100" role="region" aria-label="Document preview">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-brand-navy">Document preview</h2>
                <p className="mt-1 text-sm text-slate-500">Live draft updates as the guided fields change.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <span className="font-semibold text-brand-navy">{completedFields}</span>
                <span className="text-slate-500"> of {totalFields} items complete</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8 shadow-floating sm:p-10">
                {previewContent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
