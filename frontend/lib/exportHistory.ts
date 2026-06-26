import { getActiveOwner, subscribeToAuthChanges } from "./auth/client";
import { syncExport, syncExportRemoval } from "./documentSync";

export interface ExportRecord {
  id: string;
  slug: string;
  agreementName: string;
  fileName: string;
  exportedAt: string;
  ownerId: string;
  ownerEmail: string;
}

const STORAGE_KEY = "prelegal_exports_v1";
const EXPORTS_CHANGED_EVENT = "prelegal:exports-changed";
const EMPTY_EXPORTS: ExportRecord[] = [];

let cachedExportsJson = "";
let cachedOwnerId = "";
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

function withOwner(record: ExportRecord): ExportRecord {
  if (record.ownerId) return record;
  const owner = getActiveOwner();
  return { ...record, ownerId: owner.id, ownerEmail: owner.email };
}

function sortExports(exports: ExportRecord[]): ExportRecord[] {
  return exports.sort(
    (a, b) => new Date(b.exportedAt).getTime() - new Date(a.exportedAt).getTime()
  );
}

function isSameExport(a: ExportRecord, b: ExportRecord): boolean {
  return (
    a.ownerId === b.ownerId &&
    (a.id === b.id || (a.slug === b.slug && a.fileName === b.fileName))
  );
}

function writeExports(exports: ExportRecord[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(exports));
  cachedExportsJson = "";
  cachedOwnerId = "";
  notifyExportsChanged();
}

export function getAllExports(): ExportRecord[] {
  const owner = getActiveOwner();
  return sortExports(
    readExports()
      .map(withOwner)
      .filter((record) => record.ownerId === owner.id)
  );
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
  const owner = getActiveOwner();
  const record: ExportRecord = {
    id: `${slug}-${Date.now()}`,
    slug,
    agreementName,
    fileName: `${slug}-draft.pdf`,
    exportedAt: now,
    ownerId: owner.id,
    ownerEmail: owner.email,
  };

  writeExports([record, ...readExports()].slice(0, 50));
  syncExport(record);
  return record;
}

export function removeExport(id: string): void {
  const owner = getActiveOwner();
  const record = readExports()
    .map(withOwner)
    .find((exportRecord) => exportRecord.id === id && exportRecord.ownerId === owner.id);

  writeExports(
    readExports().filter((record) => {
      const ownedRecord = withOwner(record);
      return !(ownedRecord.id === id && ownedRecord.ownerId === owner.id);
    })
  );

  if (record) syncExportRemoval(owner.id, record.id);
}

export function mergeExportsFromRemote(remoteExports: ExportRecord[]): void {
  if (!canUseStorage() || remoteExports.length === 0) return;

  const exports = readExports().map(withOwner);
  let changed = false;

  for (const remoteExport of remoteExports) {
    const existingIndex = exports.findIndex((record) => isSameExport(record, remoteExport));
    if (existingIndex >= 0) {
      if (exports[existingIndex].id !== remoteExport.id) {
        exports[existingIndex] = remoteExport;
        changed = true;
      }
      continue;
    }

    exports.unshift(remoteExport);
    changed = true;
  }

  if (changed) writeExports(sortExports(exports).slice(0, 50));
}

export function subscribeToExports(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) onStoreChange();
  }

  window.addEventListener(EXPORTS_CHANGED_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);
  const unsubscribeFromAuth = subscribeToAuthChanges(onStoreChange);

  return () => {
    window.removeEventListener(EXPORTS_CHANGED_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
    unsubscribeFromAuth();
  };
}

export function getExportsSnapshot(): ExportRecord[] {
  if (!canUseStorage()) return EMPTY_EXPORTS;

  const owner = getActiveOwner();
  const nextJson = window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  if (nextJson !== cachedExportsJson || owner.id !== cachedOwnerId) {
    cachedExportsJson = nextJson;
    cachedOwnerId = owner.id;
    cachedExports = getAllExports();
  }

  return cachedExports;
}

export function getServerExportsSnapshot(): ExportRecord[] {
  return EMPTY_EXPORTS;
}
