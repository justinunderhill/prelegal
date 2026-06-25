import {
  getAllDrafts,
  getDraft,
  removeDraft,
  saveDraft,
} from "@/lib/drafts";

describe("draft storage", () => {
  beforeEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  it("saves and retrieves a draft by agreement slug", () => {
    saveDraft({
      slug: "mutual-nda",
      agreementName: "Mutual NDA",
      values: { purpose: "Evaluate a partnership" },
    });

    const draft = getDraft("mutual-nda");
    expect(draft?.agreementName).toBe("Mutual NDA");
    expect(draft?.values).toEqual({ purpose: "Evaluate a partnership" });
    expect(draft?.createdAt).toBeTruthy();
    expect(draft?.updatedAt).toBeTruthy();
  });

  it("returns drafts ordered by most recently updated", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-25T10:00:00.000Z"));
    saveDraft({
      slug: "mutual-nda",
      agreementName: "Mutual NDA",
      values: { purpose: "First" },
    });
    jest.setSystemTime(new Date("2026-06-25T10:01:00.000Z"));
    saveDraft({
      slug: "dpa",
      agreementName: "Data Processing Agreement",
      values: { provider_name: "DataCo" },
    });

    const drafts = getAllDrafts();
    expect(drafts[0].slug).toBe("dpa");
    expect(drafts[1].slug).toBe("mutual-nda");
  });

  it("removes a saved draft", () => {
    saveDraft({
      slug: "pilot",
      agreementName: "Pilot Agreement",
      values: { customer_name: "ClientCo" },
    });

    removeDraft("pilot");

    expect(getDraft("pilot")).toBeNull();
    expect(getAllDrafts()).toEqual([]);
  });

  it("handles malformed local storage safely", () => {
    localStorage.setItem("prelegal_drafts_v1", "{not valid json");

    expect(getAllDrafts()).toEqual([]);
    expect(getDraft("mutual-nda")).toBeNull();
  });
});
