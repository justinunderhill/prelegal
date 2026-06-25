export interface ExportRecord {
  id: string;
  slug: string;
  agreementName: string;
  fileName: string;
  exportedAt: string;
}

const STORAGE_KEY = "prelegal_exports_v1";
const EXPORTS_CHANGED_EVENT = "prelegal:exports-changed";
const EMPTY_EXPORTS: ExportRecord[] = [];

let cachedExportsJson = "";
let cachedExports: ExportRecord[] = EMPTY_EXPORTS;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyExportsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EXPORTS_CHANGED_EVENT));
}

function readExports(): ExportRecord[] {
  if (!canUseStorage()) return EMPTY_EXPORTS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_EXPORTS;
    const parsed = JSON.parse(raw) as ExportRecord[];
    return Array.isArray(parsed) ? parsed : EMPTY_EXPORTS;
  } catch {
    return EMPTY_EXPORTS;
  }
}

function sortExports(exports: ExportRecord[]): ExportRecord[] {
  return exports.sort(
    (a, b) => new Date(b.exportedAt).getTime() - new Date(a.exportedAt).getTime()
  );
}

function writeExports(exports: ExportRecord[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(exports));
  cachedExportsJson = "";
  notifyExportsChanged();
}

export function getAllExports(): ExportRecord[] {
  return sortExports([...readExports()]);
}

export function recordExport({
  slug,
  agreementName,
}: {
  slug: string;
  agreementName: string;
}): ExportRecord | null {
  if (!canUseStorage()) return null;

  const now = new Date().toISOString();
  const record: ExportRecord = {
    id: `${slug}-${Date.now()}`,
    slug,
    agreementName,
    fileName: `${slug}-draft.pdf`,
    exportedAt: now,
  };

  writeExports([record, ...readExports()].slice(0, 50));
  return record;
}

export function removeExport(id: string): void {
  writeExports(readExports().filter((record) => record.id !== id));
}

export function subscribeToExports(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) onStoreChange();
  }

  window.addEventListener(EXPORTS_CHANGED_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(EXPORTS_CHANGED_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getExportsSnapshot(): ExportRecord[] {
  if (!canUseStorage()) return EMPTY_EXPORTS;

  const nextJson = window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  if (nextJson !== cachedExportsJson) {
    cachedExportsJson = nextJson;
    cachedExports = getAllExports();
  }

  return cachedExports;
}

export function getServerExportsSnapshot(): ExportRecord[] {
  return EMPTY_EXPORTS;
}
