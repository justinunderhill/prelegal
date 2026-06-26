import {
  getAllDrafts,
  getDraft,
  mergeDraftsFromRemote,
  removeDraft,
  saveDraft,
} from "@/lib/drafts";
import { signIn, signOut } from "@/lib/auth/client";

describe("draft storage", () => {
  beforeEach(() => {
    jest.useRealTimers();
    localStorage.clear();
    Object.defineProperty(global, "fetch", {
      writable: true,
      value: jest.fn().mockRejectedValue(new TypeError("offline")),
    });
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
    expect(draft?.ownerId).toBe("anonymous");
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

  it("scopes drafts to the active signed-in user", async () => {
    await signIn("ava@example.com", "secret");
    saveDraft({
      slug: "mutual-nda",
      agreementName: "Mutual NDA",
      values: { purpose: "Ava draft" },
    });

    await signIn("ben@example.com", "secret");
    expect(getDraft("mutual-nda")).toBeNull();
    saveDraft({
      slug: "dpa",
      agreementName: "Data Processing Agreement",
      values: { provider_name: "BenCo" },
    });
    expect(getAllDrafts().map((draft) => draft.slug)).toEqual(["dpa"]);

    await signIn("ava@example.com", "secret");
    expect(getAllDrafts().map((draft) => draft.slug)).toEqual(["mutual-nda"]);
    expect(getDraft("mutual-nda")?.values).toEqual({ purpose: "Ava draft" });

    signOut();
  });

  it("hydrates missing drafts from the backend for the active user", () => {
    localStorage.setItem(
      "prelegal_user",
      JSON.stringify({ id: "server-user", email: "user@example.com" })
    );

    mergeDraftsFromRemote([
      {
        slug: "dpa",
        agreementName: "Data Processing Agreement",
        values: { provider_name: "DataCo" },
        createdAt: "2026-06-25T10:00:00.000Z",
        updatedAt: "2026-06-25T10:00:00.000Z",
        ownerId: "server-user",
        ownerEmail: "user@example.com",
      },
    ]);

    expect(getAllDrafts().map((draft) => draft.slug)).toEqual(["dpa"]);
    expect(getDraft("dpa")?.values).toEqual({ provider_name: "DataCo" });
  });

  it("keeps newer local drafts when backend hydration is older", () => {
    localStorage.setItem(
      "prelegal_user",
      JSON.stringify({ id: "server-user", email: "user@example.com" })
    );
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-25T10:05:00.000Z"));
    saveDraft({
      slug: "mutual-nda",
      agreementName: "Mutual NDA",
      values: { purpose: "Local newer" },
    });

    mergeDraftsFromRemote([
      {
        slug: "mutual-nda",
        agreementName: "Mutual NDA",
        values: { purpose: "Backend older" },
        createdAt: "2026-06-25T10:00:00.000Z",
        updatedAt: "2026-06-25T10:00:00.000Z",
        ownerId: "server-user",
        ownerEmail: "user@example.com",
      },
    ]);

    expect(getDraft("mutual-nda")?.values).toEqual({ purpose: "Local newer" });
  });
});
