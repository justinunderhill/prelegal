import { z } from "zod";
import { buildPrefilledDraftValues, countPrefillFields } from "@/lib/draftPrefill";
import { AgreementConfig } from "@/lib/templates/types";

const config: AgreementConfig = {
  slug: "mutual-nda",
  name: "Mutual NDA",
  description: "Test NDA",
  coverTemplate: null,
  termsTemplate: "/templates/test.md",
  schema: z.object({}),
  fields: [
    { key: "purpose", label: "Purpose", type: "textarea" },
    { key: "effectiveDate", label: "Effective Date", type: "date" },
    { key: "governingLaw", label: "Governing Law", type: "text" },
    { key: "party1", label: "Party 1", type: "party" },
    { key: "party2", label: "Party 2", type: "party" },
  ],
  defaultValues: {
    purpose: "",
    effectiveDate: "",
    governingLaw: "",
    party1: { name: "", title: "", company: "", address: "", signature: "" },
    party2: { name: "", title: "", company: "", address: "", signature: "" },
  },
  buildFieldMap: () => ({}),
};

describe("buildPrefilledDraftValues", () => {
  it("maps exact fields and aliases into default draft values", () => {
    const values = buildPrefilledDraftValues(config, {
      purpose: "Evaluate a partnership",
      effective_date: "2026-06-25",
      governing_law: "Delaware",
    });

    expect(values).toMatchObject({
      purpose: "Evaluate a partnership",
      effectiveDate: "2026-06-25",
      governingLaw: "Delaware",
    });
  });

  it("merges partial party fields while preserving required party shape", () => {
    const values = buildPrefilledDraftValues(config, {
      party1: { name: "Ava", company: "Acme" },
      party2: { name: "Ben", title: "GC", address: "2 Road" },
    });

    expect(values.party1).toEqual({
      name: "Ava",
      title: "",
      company: "Acme",
      address: "",
      signature: "",
    });
    expect(values.party2).toEqual({
      name: "Ben",
      title: "GC",
      company: "",
      address: "2 Road",
      signature: "",
    });
  });

  it("counts prefillable agreement fields", () => {
    expect(
      countPrefillFields(config, {
        purpose: "Evaluate",
        effective_date: "2026-06-25",
        suggested_slug: "mutual-nda",
      })
    ).toBe(2);
  });
});
