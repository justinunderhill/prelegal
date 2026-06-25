"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { removeDraft } from "@/lib/drafts";
import { removeExport } from "@/lib/exportHistory";
import { useDrafts } from "@/lib/hooks/useDrafts";
import { useExportHistory } from "@/lib/hooks/useExportHistory";

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function DocumentsPage() {
  const drafts = useDrafts();
  const exports = useExportHistory();
  const hasDocuments = drafts.length > 0 || exports.length > 0;

  return (
    <AppShell>
      <div className="min-h-full bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-floating sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-navy">
                  Document library
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-brand-navy">
                  Manage drafts and completed exports.
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Resume in-progress documents, review recent PDF exports, and keep local work organized.
                </p>
              </div>
              <Link
                href="/agreements"
                className="inline-flex items-center justify-center rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-navy/20 transition-colors hover:bg-brand-blue"
              >
                New document
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <span className="text-2xl font-bold text-brand-navy">{drafts.length}</span>
                <p className="mt-1 text-sm text-slate-600">active drafts</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <span className="text-2xl font-bold text-brand-navy">{exports.length}</span>
                <p className="mt-1 text-sm text-slate-600">PDF exports</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <span className="text-2xl font-bold text-brand-navy">Local</span>
                <p className="mt-1 text-sm text-slate-600">browser storage</p>
              </div>
            </div>
          </div>

          {!hasDocuments && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-floating">
              <h2 className="text-xl font-semibold text-brand-navy">No documents yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create a document from a template. Drafts and exported PDFs will appear here automatically.
              </p>
              <Link
                href="/agreements"
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-purple/20 transition-colors hover:bg-[#66317d]"
              >
                Browse templates
              </Link>
            </div>
          )}

          {drafts.length > 0 && (
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-brand-navy">Drafts</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Documents saved automatically in this browser.
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-floating">
                {drafts.map((draft, index) => (
                  <div
                    key={draft.slug}
                    className={`grid gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${
                      index > 0 ? "border-t border-slate-100" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-brand-navy">{draft.agreementName}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Last edited {formatTimestamp(draft.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/agreements/${draft.slug}`}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-brand-navy transition-colors hover:border-brand-blue/40 hover:text-brand-blue"
                      >
                        Resume
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeDraft(draft.slug)}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {exports.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-brand-navy">Completed exports</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    PDF download history from this browser.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {exports.map((record) => (
                  <div key={record.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-floating">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-brand-navy">{record.agreementName}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Exported {formatTimestamp(record.exportedAt)}
                        </p>
                      </div>
                      <span className="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2.5 py-1 text-xs font-semibold text-brand-navy">
                        PDF
                      </span>
                    </div>
                    <p className="mt-4 truncate rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
                      {record.fileName}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <Link
                        href={`/agreements/${record.slug}`}
                        className="text-sm font-semibold text-brand-navy transition-colors hover:text-brand-blue"
                      >
                        Open template
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeExport(record.id)}
                        className="text-sm font-semibold text-slate-400 transition-colors hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}
