import Link from "next/link";
import { AgreementConfig } from "@/lib/templates/types";

interface AgreementCardProps {
  config: AgreementConfig;
  category?: string;
  estimate?: string;
  badge?: string;
  fieldCount?: number;
}

export function AgreementCard({
  config,
  category = "Agreement",
  estimate = "5-8 min",
  badge,
  fieldCount = config.fields.length,
}: AgreementCardProps) {
  return (
    <Link
      href={`/agreements/${config.slug}`}
      className="group flex min-h-72 flex-col rounded-lg border border-premium-line bg-white p-5 shadow-floating transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-yellow/50 hover:shadow-floating-lg"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-navy text-white shadow-sm transition-colors group-hover:bg-brand-blue">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
        </div>
        {badge && (
          <span className="rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-2.5 py-1 text-xs font-semibold text-brand-navy">
            {badge}
          </span>
        )}
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span>{category}</span>
        <span className="h-1 w-1 rounded-full bg-slate-300" />
        <span>{estimate}</span>
      </div>
      <h3 className="text-lg font-semibold leading-snug text-brand-navy group-hover:text-brand-blue">
        {config.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
        {config.description}
      </p>
      <div className="mt-5 border-t border-premium-line/70 pt-4">
        <div className="mb-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
          <div>
            <span className="block font-semibold text-brand-navy">{fieldCount}</span>
            guided fields
          </div>
          <div>
            <span className="block font-semibold text-brand-navy">PDF</span>
            export ready
          </div>
        </div>
        <div className="flex items-center justify-between text-sm font-semibold text-brand-navy group-hover:text-brand-blue">
          <span>Create document</span>
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
