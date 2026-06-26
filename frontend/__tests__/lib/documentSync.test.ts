import {
  fetchRemoteDocuments,
  syncDraft,
  syncDraftRemoval,
  syncExport,
  syncExportRemoval,
} from "@/lib/documentSync";

describe("document sync", () => {
  beforeEach(() => {
    Object.defineProperty(global, "fetch", {
      writable: true,
      value: jest.fn().mockResolvedValue({ ok: true }),
    });
  });

  it("skips anonymous drafts", () => {
    syncDraft({
      slug: "mutual-nda",
      agreementName: "Mutual NDA",
      values: {},
      createdAt: "2026-06-25T10:00:00.000Z",
      updatedAt: "2026-06-25T10:00:00.000Z",
      ownerId: "anonymous",
      ownerEmail: "local browser",
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("syncs signed-in drafts", () => {
    syncDraft({
      slug: "mutual-nda",
      agreementName: "Mutual NDA",
      values: { purpose: "Evaluate" },
      createdAt: "2026-06-25T10:00:00.000Z",
      updatedAt: "2026-06-25T10:00:00.000Z",
      ownerId: "local:user-example-com",
      ownerEmail: "user@example.com",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/documents/drafts/mutual-nda",
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("syncs draft removals", () => {
    syncDraftRemoval("local:user-example-com", "dpa");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/documents/drafts/dpa?owner_id=local%3Auser-example-com",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("syncs export records", () => {
    syncExport({
      id: "export-1",
      slug: "pilot",
      agreementName: "Pilot Agreement",
      fileName: "pilot-draft.pdf",
      exportedAt: "2026-06-25T10:00:00.000Z",
      ownerId: "local:user-example-com",
      ownerEmail: "user@example.com",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/documents/exports",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches remote documents for signed-in owners", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: "doc-1", status: "draft" }],
    } as Response);

    const records = await fetchRemoteDocuments("local:user-example-com");

    expect(records).toEqual([{ id: "doc-1", status: "draft" }]);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/documents?owner_id=local%3Auser-example-com"
    );
  });

  it("syncs export removals", () => {
    syncExportRemoval("local:user-example-com", "export-1");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/documents/exports/export-1?owner_id=local%3Auser-example-com",
      expect.objectContaining({ method: "DELETE" })
    );
  });
});
