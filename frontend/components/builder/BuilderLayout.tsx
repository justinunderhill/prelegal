"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgreementConfig } from "@/lib/templates/types";
import { DynamicForm } from "./form/DynamicForm";
import {
  DocumentPreview,
  useTemplates,
} from "./preview/DocumentPreview";
import { generateAndDownloadPdf } from "@/lib/pdf/generatePdf";

interface BuilderLayoutProps {
  config: AgreementConfig;
}

export function BuilderLayout({ config }: BuilderLayoutProps) {
  const {
    register,
    setValue,
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
  const { coverTemplate, termsTemplate } = useTemplates(
    config.coverTemplate,
    config.termsTemplate
  );

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      await generateAndDownloadPdf(config, values, termsTemplate);
    } finally {
      setDownloading(false);
    }
  }, [config, values, termsTemplate]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: Form */}
      <div className="w-1/2 overflow-y-auto border-r border-slate-200 bg-white">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-slate-900">{config.name}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Fill in the fields below to generate your agreement.
          </p>
        </div>
        <div className="px-6 py-6">
          <DynamicForm
            fields={config.fields}
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />
        </div>
      </div>

      {/* Right: Preview */}
      <div className="flex w-1/2 flex-col bg-slate-50">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Preview</h2>
            <p className="mt-1 text-sm text-slate-500">
              Live preview of your document
            </p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <DocumentPreview
              coverTemplate={coverTemplate}
              termsTemplate={termsTemplate}
              values={values}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
