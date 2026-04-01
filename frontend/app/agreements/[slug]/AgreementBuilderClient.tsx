"use client";

import { getAgreementConfig } from "@/lib/agreements";
import { BuilderLayout } from "@/components/builder/BuilderLayout";

export function AgreementBuilderClient({ slug }: { slug: string }) {
  const config = getAgreementConfig(slug);

  if (!config) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-slate-500">Agreement not found.</p>
      </div>
    );
  }

  return <BuilderLayout config={config} />;
}
