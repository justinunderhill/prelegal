import {
  getAllExports,
  recordExport,
  removeExport,
} from "@/lib/exportHistory";

describe("export history", () => {
  beforeEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  it("records a PDF export", () => {
    const record = recordExport({
      slug: "mutual-nda",
      agreementName: "Mutual NDA",
    });

    expect(record?.agreementName).toBe("Mutual NDA");
    expect(record?.fileName).toBe("mutual-nda-draft.pdf");
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
});
