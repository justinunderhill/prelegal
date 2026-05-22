"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgreementConfig } from "@/lib/templates/types";
import { DynamicForm } from "./form/DynamicForm";
import { DocumentPreview } from "./preview/DocumentPreview";
import { useTemplates } from "@/lib/hooks/useTemplates";
import { generateAndDownloadPdf } from "@/lib/pdf/generatePdf";

interface BuilderLayoutProps {
  config: AgreementConfig;
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

  const values = watch();
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

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      await generateAndDownloadPdf(config, values, termsTemplate);
    } finally {
      setDownloading(false);
    }
  }, [config, values, termsTemplate]);

  const handleClear = useCallback(() => {
    if (window.confirm("Clear all fields and start this document over?")) {
      reset(config.defaultValues);
    }
  }, [reset, config.defaultValues]);

  // Toolbar: navigate back to the catalog or reset the current document.
  const builderToolbar = (
    <div className="flex items-center justify-between">
      <Link
        href="/agreements"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-gray transition-colors hover:text-brand-navy"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to menu
      </Link>
      <button
        type="button"
        onClick={handleClear}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-brand-gray transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
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
      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-brand-purple to-[#5e2d75] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-purple/25 transition-all hover:shadow-lg hover:shadow-brand-purple/30 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
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
      <div className="flex flex-col lg:hidden">
        <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
          {builderToolbar}
          <h2 className="mt-3 text-lg font-bold tracking-tight text-brand-navy">{config.name}</h2>
          <p className="mt-1 text-sm text-brand-gray">Fill in the fields below to generate your agreement.</p>
        </div>
        <div className="bg-white px-4 py-6 sm:px-6">
          <DynamicForm fields={config.fields} register={register} setValue={setValue} watch={watch} errors={errors} />
        </div>
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-navy">Preview</h2>
            {downloadButton}
          </div>
        </div>
        <div className="bg-gray-50 px-4 pb-8 sm:px-6">
          <div className="mx-auto max-w-2xl rounded-xl border border-gray-200/70 bg-white p-5 shadow-floating sm:p-8">
            {previewContent}
          </div>
        </div>
      </div>

      {/* Desktop: side-by-side with independent scroll */}
      <div className="hidden lg:flex" style={{ height: "calc(100vh - 4rem)" }}>
        {/* Left: Form */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-200 bg-white" role="region" aria-label="Agreement form">
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
            {builderToolbar}
            <h2 className="mt-3 text-lg font-bold tracking-tight text-brand-navy">{config.name}</h2>
            <p className="mt-1 text-sm text-brand-gray">Fill in the fields below to generate your agreement.</p>
          </div>
          <div className="px-6 py-6">
            <DynamicForm fields={config.fields} register={register} setValue={setValue} watch={watch} errors={errors} />
          </div>
        </div>
        {/* Right: Preview */}
        <div className="flex w-1/2 flex-col bg-gray-50" role="region" aria-label="Document preview">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
            <div>
              <h2 className="text-lg font-semibold text-brand-navy">Preview</h2>
              <p className="mt-1 text-sm text-brand-gray">Live preview of your document</p>
            </div>
            {downloadButton}
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-2xl rounded-xl border border-gray-200/70 bg-white p-8 shadow-floating sm:p-10">
              {previewContent}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
