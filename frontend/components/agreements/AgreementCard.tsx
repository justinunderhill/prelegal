import Link from "next/link";
import { AgreementConfig } from "@/lib/templates/types";

interface AgreementCardProps {
  config: AgreementConfig;
}

export function AgreementCard({ config }: AgreementCardProps) {
  return (
    <Link
      href={`/agreements/${config.slug}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-slate-200">
        <svg
          className="h-5 w-5 text-slate-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-900 group-hover:text-slate-700">
        {config.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
        {config.description}
      </p>
      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-slate-900 group-hover:text-slate-700">
        Create document
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
    </Link>
  );
}
