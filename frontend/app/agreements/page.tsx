"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AgreementCard } from "@/components/agreements/AgreementCard";
import { IntakeChat } from "@/components/agreements/IntakeChat";
import { getAllAgreements } from "@/lib/agreements";
import { DraftRecord, removeDraft } from "@/lib/drafts";
import { useDrafts } from "@/lib/hooks/useDrafts";
import { AgreementConfig } from "@/lib/templates/types";

type AgreementMeta = {
  category: string;
  estimate: string;
  badge?: string;
};

const agreementMeta: Record<string, AgreementMeta> = {
  "mutual-nda": { category: "Confidentiality", estimate: "6 min", badge: "Popular" },
  csa: { category: "Commercial", estimate: "12 min", badge: "Core" },
  dpa: { category: "Privacy", estimate: "10 min", badge: "GDPR" },
  psa: { category: "Services", estimate: "12 min", badge: "Core" },
  sla: { category: "Operations", estimate: "7 min" },
  "design-partner": { category: "Product", estimate: "8 min" },
  partnership: { category: "Business", estimate: "11 min" },
  pilot: { category: "Sales", estimate: "8 min" },
  baa: { category: "Healthcare", estimate: "9 min", badge: "HIPAA" },
  "software-license": { category: "Technology", estimate: "11 min" },
  "ai-addendum": { category: "AI", estimate: "5 min", badge: "New" },
};

const categoryOrder = ["All", "Commercial", "Privacy", "Technology", "Confidentiality", "AI"];
const hiddenCategoryFilters = new Set(["Product", "Sales", "Services"]);

function getMeta(config: AgreementConfig): AgreementMeta {
  return agreementMeta[config.slug] ?? { category: "Agreement", estimate: "8 min" };
}

function matchesSearchQuery(agreement: AgreementConfig, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const meta = getMeta(agreement);
  const searchable = [
    agreement.name,
    agreement.description,
    meta.category,
    meta.badge ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return searchable.includes(normalizedQuery);
}

function formatDraftTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function DraftCard({ draft }: { draft: DraftRecord }) {
  return (
    <div className="rounded-lg border border-premium-line bg-white p-4 shadow-floating">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-brand-navy">
            {draft.agreementName}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Last edited {formatDraftTimestamp(draft.updatedAt)}
          </p>
        </div>
        <span className="rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-2.5 py-1 text-xs font-semibold text-brand-navy">
          Draft
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <Link
          href={`/agreements/${draft.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy transition-colors hover:text-brand-blue"
        >
          Resume
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
        <button
          type="button"
          onClick={() => removeDraft(draft.slug)}
          className="text-sm font-semibold text-slate-400 transition-colors hover:text-premium-danger"
        >
          Discard
        </button>
      </div>
    </div>
  );
}

export default function AgreementsPage() {
  const agreements = useMemo(() => getAllAgreements(), []);
  const drafts = useDrafts();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const searchMatchedAgreements = useMemo(
    () => agreements.filter((agreement) => matchesSearchQuery(agreement, query)),
    [agreements, query]
  );

  const categories = useMemo(() => {
    const available = new Set(
      searchMatchedAgreements
        .map((agreement) => getMeta(agreement).category)
        .filter((category) => !hiddenCategoryFilters.has(category))
    );
    const ordered = categoryOrder.filter((category) => category === "All" || available.has(category));
    const remaining = Array.from(available)
      .filter((category) => !ordered.includes(category))
      .sort();
    return [...ordered, ...remaining];
  }, [searchMatchedAgreements]);

  const selectedCategory = categories.includes(activeCategory) ? activeCategory : "All";

  const filteredAgreements = useMemo(() => {
    return searchMatchedAgreements.filter((agreement) => {
      const meta = getMeta(agreement);
      return selectedCategory === "All" || meta.category === selectedCategory;
    });
  }, [searchMatchedAgreements, selectedCategory]);

  const visibleDrafts = useMemo(() => {
    const agreementSlugs = new Set(agreements.map((agreement) => agreement.slug));
    return drafts.filter((draft) => agreementSlugs.has(draft.slug)).slice(0, 3);
  }, [agreements, drafts]);

  return (
    <AppShell>
      <div className="bg-premium-muted">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <section className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="rounded-lg border border-premium-line bg-white p-6 shadow-floating sm:p-7">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-navy">
                  Legal workspace
                </span>
                <span className="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-navy">
                  AI-assisted drafting
                </span>
              </div>
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                Start with the right agreement and move quickly to a clean draft.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Choose a vetted template, answer guided questions, preview the document live,
                and export a polished PDF when the draft is ready.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-premium-line bg-premium-muted p-4">
                  <span className="text-2xl font-bold text-brand-navy">{agreements.length}</span>
                  <p className="mt-1 text-sm text-slate-600">agreement templates</p>
                </div>
                <div className="rounded-lg border border-premium-line bg-premium-muted p-4">
                  <span className="text-2xl font-bold text-brand-navy">{categories.length - 1}</span>
                  <p className="mt-1 text-sm text-slate-600">practice areas</p>
                </div>
                <div className="rounded-lg border border-premium-line bg-premium-muted p-4">
                  <span className="text-2xl font-bold text-brand-navy">Live</span>
                  <p className="mt-1 text-sm text-slate-600">document preview</p>
                </div>
              </div>
            </div>

            <aside className="rounded-lg border border-brand-navy bg-brand-navy p-6 text-white shadow-floating-lg">
              <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/10">
                <svg className="h-5 w-5 text-brand-yellow" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">Need help choosing?</h2>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Use the assistant to describe the transaction, parties, and risk profile.
                It can point you to the most relevant template.
              </p>
              <div className="mt-6 rounded-lg border border-white/10 bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-yellow">
                  Suggested prompt
                </p>
                <p className="mt-2 text-sm leading-6 text-white/85">
                  “I need to share confidential product plans with a potential partner.”
                </p>
              </div>
            </aside>
          </section>

          {visibleDrafts.length > 0 && (
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-brand-navy">Recent drafts</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Continue documents saved in this browser.
                  </p>
                </div>
                <span className="hidden rounded-full border border-premium-line bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:inline">
                  Local autosave
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {visibleDrafts.map((draft) => (
                  <DraftCard key={draft.slug} draft={draft} />
                ))}
              </div>
            </section>
          )}

          <section className="mb-6 rounded-lg border border-premium-line bg-white p-4 shadow-floating">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveCategory("All");
                  }}
                  placeholder="Search agreements, privacy, licensing, services..."
                  className="w-full rounded-lg border border-premium-line bg-premium-muted py-2.5 pl-10 pr-3 text-sm text-brand-navy placeholder:text-slate-400 transition-colors focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                      selectedCategory === category
                        ? "border-brand-navy bg-brand-navy text-white"
                        : "border-premium-line bg-white text-slate-600 hover:border-brand-yellow/50 hover:text-brand-navy"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-brand-navy">Templates</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredAgreements.length} available for the current view
              </p>
            </div>
            <span className="hidden text-sm font-medium text-slate-500 sm:inline">
              Select a template to open the guided builder
            </span>
          </div>

          {filteredAgreements.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredAgreements.map((config) => {
                const meta = getMeta(config);
                return (
                  <AgreementCard
                    key={config.slug}
                    config={config}
                    category={meta.category}
                    estimate={meta.estimate}
                    badge={meta.badge}
                    fieldCount={config.fields.length}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <h2 className="text-lg font-semibold text-brand-navy">No templates found</h2>
              <p className="mt-2 text-sm text-slate-500">
                Adjust your search or choose another category.
              </p>
            </div>
          )}
        </div>
      </div>
      <IntakeChat />
    </AppShell>
  );
}
