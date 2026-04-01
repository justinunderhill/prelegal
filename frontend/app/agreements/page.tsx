import { AppShell } from "@/components/layout/AppShell";
import { AgreementCard } from "@/components/agreements/AgreementCard";
import { getAllAgreements } from "@/lib/agreements";

export default function AgreementsPage() {
  const agreements = getAllAgreements();

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Legal Agreements
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            Select an agreement type to get started. Fill in your details and
            download a ready-to-sign document.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agreements.map((config) => (
            <AgreementCard key={config.slug} config={config} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
