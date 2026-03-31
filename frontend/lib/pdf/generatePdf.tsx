"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import { buildFieldMap, substituteSpanLinks } from "../templates/engine";
import { AgreementConfig, PartyValues } from "../templates/types";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
    { src: "Helvetica-Oblique", fontStyle: "italic" },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.6,
    padding: 60,
    color: "#1e293b",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#0f172a",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 6,
    color: "#0f172a",
  },
  paragraph: {
    fontSize: 10,
    marginBottom: 8,
    textAlign: "justify",
  },
  label: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 10,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottom: "1px solid #e2e8f0",
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    width: "45%",
  },
  signatureImage: {
    height: 50,
    width: 150,
    marginBottom: 4,
  },
  signatureLine: {
    borderBottom: "1px solid #334155",
    marginBottom: 4,
    height: 50,
  },
  signatureLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 8,
  },
  divider: {
    borderBottom: "1px solid #cbd5e1",
    marginVertical: 20,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 60,
    right: 60,
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
  },
});

function CoverPagePdf({ values }: { values: Record<string, unknown> }) {
  const party1 = values.party1 as PartyValues;
  const party2 = values.party2 as PartyValues;

  const mndaTermType = values.mndaTermType as string;
  const mndaTermYears = values.mndaTermYears as string;
  const confType = values.confidentialityType as string;
  const confYears = values.confidentialityYears as string;

  const mndaTerm =
    mndaTermType === "until_terminated"
      ? "Continues until terminated"
      : `Expires ${mndaTermYears || "1"} year(s) from Effective Date`;

  const confTerm =
    confType === "perpetual"
      ? "In perpetuity"
      : `${confYears || "1"} year(s) from Effective Date (trade secrets protected indefinitely)`;

  return (
    <Page size="LETTER" style={styles.page}>
      <Text style={styles.title}>Mutual Non-Disclosure Agreement</Text>
      <Text style={styles.paragraph}>
        This Mutual Non-Disclosure Agreement consists of: (1) this Cover Page
        and (2) the Common Paper Mutual NDA Standard Terms Version 1.0.
      </Text>

      <View style={styles.divider} />

      <Text style={styles.label}>Purpose</Text>
      <Text style={styles.fieldValue}>
        {(values.purpose as string) || "—"}
      </Text>

      <Text style={styles.label}>Effective Date</Text>
      <Text style={styles.fieldValue}>
        {(values.effectiveDate as string) || "—"}
      </Text>

      <Text style={styles.label}>MNDA Term</Text>
      <Text style={styles.fieldValue}>{mndaTerm}</Text>

      <Text style={styles.label}>Term of Confidentiality</Text>
      <Text style={styles.fieldValue}>{confTerm}</Text>

      <Text style={styles.label}>Governing Law</Text>
      <Text style={styles.fieldValue}>
        {(values.governingLaw as string) || "—"}
      </Text>

      <Text style={styles.label}>Jurisdiction</Text>
      <Text style={styles.fieldValue}>
        {(values.jurisdiction as string) || "—"}
      </Text>

      {(values.modifications as string) && (
        <>
          <Text style={styles.label}>MNDA Modifications</Text>
          <Text style={styles.fieldValue}>
            {values.modifications as string}
          </Text>
        </>
      )}

      <View style={styles.divider} />

      <Text style={styles.paragraph}>
        By signing this Cover Page, each party agrees to enter into this MNDA as
        of the Effective Date.
      </Text>

      <View style={styles.signatureSection}>
        {[
          { label: "Party 1", party: party1 },
          { label: "Party 2", party: party2 },
        ].map(({ label, party }) => (
          <View key={label} style={styles.signatureBlock}>
            <Text style={styles.sectionTitle}>{label}</Text>
            <Text style={styles.label}>Signature</Text>
            {party?.signature ? (
              <Image src={party.signature} style={styles.signatureImage} />
            ) : (
              <View style={styles.signatureLine} />
            )}
            <Text style={styles.label}>Print Name</Text>
            <Text style={styles.fieldValue}>{party?.name || "—"}</Text>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.fieldValue}>{party?.title || "—"}</Text>
            <Text style={styles.label}>Company</Text>
            <Text style={styles.fieldValue}>{party?.company || "—"}</Text>
            <Text style={styles.label}>Notice Address</Text>
            <Text style={styles.fieldValue}>{party?.address || "—"}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0) — CC BY 4.0
      </Text>
    </Page>
  );
}

function StandardTermsPdf({ terms }: { terms: string }) {
  // Parse markdown sections into simple text blocks
  const lines = terms.split("\n").filter((l) => l.trim());
  const blocks: { type: "heading" | "paragraph"; text: string }[] = [];

  for (const line of lines) {
    if (line.startsWith("# ")) {
      blocks.push({ type: "heading", text: line.replace(/^#+\s*/, "") });
    } else {
      // Clean markdown formatting for PDF
      const clean = line
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/<span[^>]*>([^<]*)<\/span>/g, "$1");
      blocks.push({ type: "paragraph", text: clean });
    }
  }

  return (
    <Page size="LETTER" style={styles.page}>
      {blocks.map((block, i) =>
        block.type === "heading" ? (
          <Text key={i} style={styles.title}>
            {block.text}
          </Text>
        ) : (
          <Text key={i} style={styles.paragraph}>
            {block.text}
          </Text>
        )
      )}
      <Text style={styles.footer}>
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0) — CC BY 4.0
      </Text>
    </Page>
  );
}

function NdaDocument({
  config,
  values,
  termsMarkdown,
}: {
  config: AgreementConfig;
  values: Record<string, unknown>;
  termsMarkdown: string;
}) {
  return (
    <Document>
      <CoverPagePdf values={values} />
      <StandardTermsPdf terms={termsMarkdown} />
    </Document>
  );
}

export async function generateAndDownloadPdf(
  config: AgreementConfig,
  values: Record<string, unknown>,
  termsMarkdown: string
) {
  // Substitute values into the terms for the PDF
  const fieldMap = buildFieldMap(values);
  const processedTerms = substituteSpanLinks(termsMarkdown, fieldMap);

  const blob = await pdf(
    <NdaDocument
      config={config}
      values={values}
      termsMarkdown={processedTerms}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${config.slug}-${(values.effectiveDate as string) || "draft"}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
