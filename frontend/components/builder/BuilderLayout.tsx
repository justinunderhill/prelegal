"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgreementConfig } from "@/lib/templates/types";
import { BuilderMode } from "@/lib/chat/types";
import { DynamicForm } from "./form/DynamicForm";
import { DocumentPreview } from "./preview/DocumentPreview";
import { ModeToggle } from "./ModeToggle";
import { ChatPanel } from "./chat/ChatPanel";
import { useTemplates } from "@/lib/hooks/useTemplates";
import { generateAndDownloadPdf } from "@/lib/pdf/generatePdf";

interface BuilderLayoutProps {
  config: AgreementConfig;
}

export function BuilderLayout({ config }: BuilderLayoutProps) {
  const [mode, setMode] = useState<BuilderMode>("chat");

  const {
    register,
    setValue,
    getValues,
    watch,
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
  const templatesLoaded = Boolean(coverTemplate && termsTemplate);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      await generateAndDownloadPdf(config, values, termsTemplate);
    } finally {
      setDownloading(false);
    }
  }, [config, values, termsTemplate]);

  const handleFieldsExtracted = useCallback(
    (fields: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(fields)) {
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          // Deep merge for nested objects (party1, party2)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const currentVal = getValues(key as any) as Record<string, unknown> | undefined;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setValue(key as any, { ...currentVal, ...value });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setValue(key as any, value);
        }
      }
    },
    [setValue, getValues]
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: Chat or Form */}
      <div className="flex w-1/2 flex-col overflow-hidden border-r border-gray-200 bg-white" role="region" aria-label={mode === "chat" ? "AI Chat" : "Agreement form"}>
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-sm space-y-3">
          <h2 className="text-lg font-semibold text-brand-navy">{config.name}</h2>
          <ModeToggle mode={mode} onChange={setMode} />
        </div>

        {mode === "form" ? (
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <DynamicForm
              fields={config.fields}
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />
          </div>
        ) : (
          <ChatPanel
            slug={config.slug}
            agreementName={config.name}
            onFieldsExtracted={handleFieldsExtracted}
            onSwitchToForm={() => setMode("form")}
          />
        )}
      </div>

      {/* Right: Preview */}
      <div className="flex w-1/2 flex-col bg-gray-50" role="region" aria-label="Document preview">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
          <div>
            <h2 className="text-lg font-semibold text-brand-navy">Preview</h2>
            <p className="mt-1 text-sm text-brand-gray">
              Live preview of your document
            </p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading || !templatesLoaded}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-purple/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            {templateError ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <p className="text-sm font-medium text-red-600">Failed to load document templates</p>
                <p className="text-xs text-brand-gray">{templateError}</p>
              </div>
            ) : (
              <DocumentPreview
                coverTemplate={coverTemplate}
                termsTemplate={termsTemplate}
                values={values}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
