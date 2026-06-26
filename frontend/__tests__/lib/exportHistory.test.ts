import {
  getAllExports,
  mergeExportsFromRemote,
  recordExport,
  removeExport,
} from "@/lib/exportHistory";
import { signIn, signOut } from "@/lib/auth/client";

describe("export history", () => {
  beforeEach(() => {
    jest.useRealTimers();
    localStorage.clear();
    Object.defineProperty(global, "fetch", {
      writable: true,
      value: jest.fn().mockRejectedValue(new TypeError("offline")),
    });
  });

  it("records a PDF export", () => {
    const record = recordExport({
      slug: "mutual-nda",
      agreementName: "Mutual NDA",
    });

    expect(record?.agreementName).toBe("Mutual NDA");
    expect(record?.fileName).toBe("mutual-nda-draft.pdf");
    expect(record?.ownerId).toBe("anonymous");
    expect(getAllExports()).toHaveLength(1);
  });

  it("orders exports by most recent first", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-25T10:00:00.000Z"));
    recordExport({ slug: "mutual-nda", agreementName: "Mutual NDA" });
    jest.setSystemTime(new Date("2026-06-25T10:01:00.000Z"));
    recordExport({ slug: "dpa", agreementName: "Data Processing Agreement" });

    const exports = getAllExports();
    expect(exports[0].slug).toBe("dpa");
    expect(exports[1].slug).toBe("mutual-nda");
  });

  it("removes an export record", () => {
    const record = recordExport({
      slug: "pilot",
      agreementName: "Pilot Agreement",
    });

    removeExport(record!.id);

    expect(getAllExports()).toEqual([]);
  });

  it("scopes exports to the active signed-in user", async () => {
    await signIn("ava@example.com", "secret");
    recordExport({ slug: "mutual-nda", agreementName: "Mutual NDA" });

    await signIn("ben@example.com", "secret");
    expect(getAllExports()).toEqual([]);
    recordExport({ slug: "dpa", agreementName: "Data Processing Agreement" });
    expect(getAllExports().map((record) => record.slug)).toEqual(["dpa"]);

    await signIn("ava@example.com", "secret");
    expect(getAllExports().map((record) => record.slug)).toEqual(["mutual-nda"]);

    signOut();
  });

  it("hydrates backend exports without duplicating matching local exports", () => {
    localStorage.setItem(
      "prelegal_user",
      JSON.stringify({ id: "server-user", email: "user@example.com" })
    );
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-25T10:00:00.000Z"));
    recordExport({ slug: "pilot", agreementName: "Pilot Agreement" });

    mergeExportsFromRemote([
      {
        id: "server-export-id",
        slug: "pilot",
        agreementName: "Pilot Agreement",
        fileName: "pilot-draft.pdf",
        exportedAt: "2026-06-25T10:00:02.000Z",
        ownerId: "server-user",
        ownerEmail: "user@example.com",
      },
    ]);

    const exports = getAllExports();
    expect(exports).toHaveLength(1);
    expect(exports[0].id).toBe("server-export-id");
  });
});
