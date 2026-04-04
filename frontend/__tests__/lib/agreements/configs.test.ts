import { getAllAgreements, getAgreementConfig, agreements } from "@/lib/agreements";
import { AgreementConfig } from "@/lib/templates/types";

const EXPECTED_SLUGS = [
  "mutual-nda",
  "csa",
  "dpa",
  "psa",
  "sla",
  "design-partner",
  "partnership",
  "pilot",
  "baa",
  "software-license",
  "ai-addendum",
];

describe("Agreement Registry", () => {
  it("has all expected agreement types registered", () => {
    for (const slug of EXPECTED_SLUGS) {
      expect(agreements[slug]).toBeDefined();
    }
  });

  it("getAllAgreements returns all agreements", () => {
    const all = getAllAgreements();
    expect(all.length).toBe(EXPECTED_SLUGS.length);
  });

  it("getAgreementConfig returns config for known slugs", () => {
    for (const slug of EXPECTED_SLUGS) {
      const config = getAgreementConfig(slug);
      expect(config).toBeDefined();
      expect(config!.slug).toBe(slug);
    }
  });

  it("getAgreementConfig returns undefined for unknown slug", () => {
    expect(getAgreementConfig("nonexistent")).toBeUndefined();
  });
});

describe("All Agreement Configs", () => {
  const allConfigs = getAllAgreements();

  it.each(allConfigs.map((c) => [c.slug, c]))(
    "%s has required properties",
    (_slug: string, config: AgreementConfig) => {
      expect(config.slug).toBeTruthy();
      expect(config.name).toBeTruthy();
      expect(config.description).toBeTruthy();
      expect(config.termsTemplate).toBeTruthy();
      expect(config.fields.length).toBeGreaterThan(0);
      expect(config.schema).toBeDefined();
      expect(config.defaultValues).toBeDefined();
      expect(typeof config.buildFieldMap).toBe("function");
    }
  );

  it.each(allConfigs.map((c) => [c.slug, c]))(
    "%s buildFieldMap returns a record with string values",
    (_slug: string, config: AgreementConfig) => {
      const fieldMap = config.buildFieldMap(config.defaultValues);
      expect(typeof fieldMap).toBe("object");
      for (const [key, value] of Object.entries(fieldMap)) {
        expect(typeof key).toBe("string");
        expect(typeof value).toBe("string");
      }
    }
  );

  it.each(allConfigs.map((c) => [c.slug, c]))(
    "%s has defaultValues for all schema fields",
    (_slug: string, config: AgreementConfig) => {
      for (const field of config.fields) {
        if (field.type === "party" || field.type === "signature") continue;
        expect(config.defaultValues).toHaveProperty(field.key);
      }
    }
  );

  it.each(allConfigs.map((c) => [c.slug, c]))(
    "%s termsTemplate points to a valid path",
    (_slug: string, config: AgreementConfig) => {
      expect(config.termsTemplate).toMatch(/^\/templates\/.*\.md$/);
    }
  );

  it.each(allConfigs.map((c) => [c.slug, c]))(
    "%s buildFieldMap uses placeholders for empty values",
    (_slug: string, config: AgreementConfig) => {
      const fieldMap = config.buildFieldMap(config.defaultValues);
      // At least some values should be placeholder brackets when defaults are empty
      const values = Object.values(fieldMap);
      const hasPlaceholders = values.some((v) => v.startsWith("[") && v.endsWith("]"));
      const hasDefaults = values.some((v) => v === "None" || v === "No");
      expect(hasPlaceholders || hasDefaults).toBe(true);
    }
  );
});

describe("Cover Page Generation", () => {
  it("mutual-nda has a custom generateCoverPage", () => {
    const config = getAgreementConfig("mutual-nda")!;
    expect(config.generateCoverPage).toBeDefined();
  });

  it.each(
    getAllAgreements()
      .filter((c) => c.slug !== "mutual-nda")
      .map((c) => [c.slug, c])
  )(
    "%s generateCoverPage produces markdown with agreement name",
    (_slug: string, config: AgreementConfig) => {
      if (!config.generateCoverPage) return;
      const coverPage = config.generateCoverPage(config.defaultValues);
      expect(coverPage).toContain(config.name);
      expect(coverPage).toContain("Cover Page");
    }
  );
});
