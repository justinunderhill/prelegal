import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { agreements } from "@/lib/agreements";
import { AgreementBuilderClient } from "./AgreementBuilderClient";

export function generateStaticParams() {
  return Object.keys(agreements).map((slug) => ({ slug }));
}

export default async function AgreementBuilderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!agreements[slug]) {
    notFound();
  }

  return (
    <AppShell>
      <AgreementBuilderClient slug={slug} />
    </AppShell>
  );
}
