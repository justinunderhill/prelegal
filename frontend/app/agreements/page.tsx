import { AppShell } from "@/components/layout/AppShell";
import { AgreementCard } from "@/components/agreements/AgreementCard";
import { IntakeChat } from "@/components/agreements/IntakeChat";
import { getAllAgreements } from "@/lib/agreements";

export default function AgreementsPage() {
  const agreements = getAllAgreements();

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
            Legal Agreements
          </h1>
          <p className="mt-2 text-base text-brand-gray sm:text-lg">
            Select an agreement type to get started, or ask our AI assistant to help you choose.
          </p>
        </div>
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agreements.map((config) => (
            <AgreementCard key={config.slug} config={config} />
          ))}
        </div>
      </div>
      <IntakeChat />
    </AppShell>
  );
}
