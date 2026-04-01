import {
  getAgreementConfig,
  getAllAgreements,
  agreements,
} from "@/lib/agreements";
import { mutualNdaConfig, mutualNdaSchema } from "@/lib/agreements/mutual-nda.config";

describe("Agreement Registry", () => {
  describe("getAgreementConfig", () => {
    it("returns the mutual-nda config for valid slug", () => {
      const config = getAgreementConfig("mutual-nda");
      expect(config).toBeDefined();
      expect(config!.slug).toBe("mutual-nda");
      expect(config!.name).toBe("Mutual Non-Disclosure Agreement");
    });

    it("returns undefined for unknown slug", () => {
      expect(getAgreementConfig("nonexistent")).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      expect(getAgreementConfig("")).toBeUndefined();
    });
  });

  describe("getAllAgreements", () => {
    it("returns an array of all agreements", () => {
      const all = getAllAgreements();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThan(0);
    });

    it("includes mutual-nda", () => {
      const all = getAllAgreements();
      expect(all.some((a) => a.slug === "mutual-nda")).toBe(true);
    });
  });

  describe("agreements map", () => {
    it("has string keys matching config slugs", () => {
      for (const [key, config] of Object.entries(agreements)) {
        expect(key).toBe(config.slug);
      }
    });
  });
});

describe("Mutual NDA Config", () => {
  it("has the correct slug", () => {
    expect(mutualNdaConfig.slug).toBe("mutual-nda");
  });

  it("has cover and terms template paths", () => {
    expect(mutualNdaConfig.coverTemplate).toMatch(/Mutual-NDA-coverpage\.md$/);
    expect(mutualNdaConfig.termsTemplate).toMatch(/Mutual-NDA\.md$/);
  });

  it("defines all expected fields", () => {
    const keys = mutualNdaConfig.fields.map((f) => f.key);
    expect(keys).toContain("purpose");
    expect(keys).toContain("effectiveDate");
    expect(keys).toContain("mndaTermType");
    expect(keys).toContain("mndaTermYears");
    expect(keys).toContain("confidentialityType");
    expect(keys).toContain("confidentialityYears");
    expect(keys).toContain("governingLaw");
    expect(keys).toContain("jurisdiction");
    expect(keys).toContain("modifications");
    expect(keys).toContain("party1");
    expect(keys).toContain("party2");
  });

  it("has 11 fields total", () => {
    expect(mutualNdaConfig.fields).toHaveLength(11);
  });

  it("groups fields into Agreement Details, Legal Terms, and Parties", () => {
    const groups = new Set(mutualNdaConfig.fields.map((f) => f.group));
    expect(groups).toContain("Agreement Details");
    expect(groups).toContain("Legal Terms");
    expect(groups).toContain("Parties");
  });

  it("has default values for all fields", () => {
    const defaults = mutualNdaConfig.defaultValues;
    expect(defaults.purpose).toBeTruthy();
    expect(defaults.effectiveDate).toBeTruthy();
    expect(defaults.mndaTermType).toBe("fixed");
    expect(defaults.mndaTermYears).toBe("1");
    expect(defaults.confidentialityType).toBe("fixed");
    expect(defaults.confidentialityYears).toBe("1");
    expect(defaults.party1).toBeDefined();
    expect(defaults.party2).toBeDefined();
  });

  it("sets effectiveDate default to today", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(mutualNdaConfig.defaultValues.effectiveDate).toBe(today);
  });

  describe("radio fields have options", () => {
    it("mndaTermType has two options", () => {
      const field = mutualNdaConfig.fields.find(
        (f) => f.key === "mndaTermType"
      );
      expect(field?.options).toHaveLength(2);
      expect(field?.options?.map((o) => o.value)).toEqual([
        "fixed",
        "until_terminated",
      ]);
    });

    it("confidentialityType has two options", () => {
      const field = mutualNdaConfig.fields.find(
        (f) => f.key === "confidentialityType"
      );
      expect(field?.options).toHaveLength(2);
      expect(field?.options?.map((o) => o.value)).toEqual([
        "fixed",
        "perpetual",
      ]);
    });
  });
});

describe("Mutual NDA Schema Validation", () => {
  const validData = {
    purpose: "Business evaluation",
    effectiveDate: "2026-04-01",
    mndaTermType: "fixed" as const,
    mndaTermYears: "2",
    confidentialityType: "fixed" as const,
    confidentialityYears: "1",
    governingLaw: "Delaware",
    jurisdiction: "New Castle, DE",
    modifications: "",
    party1: {
      name: "Alice",
      title: "CEO",
      company: "Acme",
      address: "alice@acme.com",
      signature: "",
    },
    party2: {
      name: "Bob",
      title: "CTO",
      company: "Beta",
      address: "bob@beta.com",
      signature: "",
    },
  };

  it("accepts valid data", () => {
    const result = mutualNdaSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects empty purpose", () => {
    const result = mutualNdaSchema.safeParse({
      ...validData,
      purpose: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty effectiveDate", () => {
    const result = mutualNdaSchema.safeParse({
      ...validData,
      effectiveDate: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid mndaTermType", () => {
    const result = mutualNdaSchema.safeParse({
      ...validData,
      mndaTermType: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty governing law", () => {
    const result = mutualNdaSchema.safeParse({
      ...validData,
      governingLaw: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty jurisdiction", () => {
    const result = mutualNdaSchema.safeParse({
      ...validData,
      jurisdiction: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects party with empty name", () => {
    const result = mutualNdaSchema.safeParse({
      ...validData,
      party1: { ...validData.party1, name: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects party with empty title", () => {
    const result = mutualNdaSchema.safeParse({
      ...validData,
      party1: { ...validData.party1, title: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects party with empty company", () => {
    const result = mutualNdaSchema.safeParse({
      ...validData,
      party2: { ...validData.party2, company: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects party with empty address", () => {
    const result = mutualNdaSchema.safeParse({
      ...validData,
      party2: { ...validData.party2, address: "" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty modifications", () => {
    const result = mutualNdaSchema.safeParse({
      ...validData,
      modifications: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty signature (not required)", () => {
    const result = mutualNdaSchema.safeParse({
      ...validData,
      party1: { ...validData.party1, signature: "" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts until_terminated term type", () => {
    const result = mutualNdaSchema.safeParse({
      ...validData,
      mndaTermType: "until_terminated",
    });
    expect(result.success).toBe(true);
  });

  it("accepts perpetual confidentiality type", () => {
    const result = mutualNdaSchema.safeParse({
      ...validData,
      confidentialityType: "perpetual",
    });
    expect(result.success).toBe(true);
  });
});
