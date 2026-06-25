export interface DraftRecord {
  slug: string;
  agreementName: string;
  values: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "prelegal_drafts_v1";
const DRAFTS_CHANGED_EVENT = "prelegal:drafts-changed";
const EMPTY_DRAFTS: DraftRecord[] = [];

let cachedDraftsJson = "";
let cachedDrafts: DraftRecord[] = EMPTY_DRAFTS;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyDraftsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DRAFTS_CHANGED_EVENT));
}

function readDraftMap(): Record<string, DraftRecord> {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, DraftRecord>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeDraftMap(drafts: Record<string, DraftRecord>): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  cachedDraftsJson = "";
  notifyDraftsChanged();
}

function sortDrafts(drafts: DraftRecord[]): DraftRecord[] {
  return drafts.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getDraft(slug: string): DraftRecord | null {
  return readDraftMap()[slug] ?? null;
}

export function getAllDrafts(): DraftRecord[] {
  return sortDrafts(Object.values(readDraftMap()));
}

export function saveDraft({
  slug,
  agreementName,
  values,
}: {
  slug: string;
  agreementName: string;
  values: Record<string, unknown>;
}): DraftRecord | null {
  if (!canUseStorage()) return null;

  const drafts = readDraftMap();
  const now = new Date().toISOString();
  const existing = drafts[slug];
  const draft: DraftRecord = {
    slug,
    agreementName,
    values,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  drafts[slug] = draft;
  writeDraftMap(drafts);
  return draft;
}

export function removeDraft(slug: string): void {
  const drafts = readDraftMap();
  if (!drafts[slug]) return;
  delete drafts[slug];
  writeDraftMap(drafts);
}

export function subscribeToDrafts(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) onStoreChange();
  }

  window.addEventListener(DRAFTS_CHANGED_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(DRAFTS_CHANGED_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getDraftsSnapshot(): DraftRecord[] {
  if (!canUseStorage()) return EMPTY_DRAFTS;

  const nextJson = window.localStorage.getItem(STORAGE_KEY) ?? "{}";
  if (nextJson !== cachedDraftsJson) {
    cachedDraftsJson = nextJson;
    cachedDrafts = getAllDrafts();
  }

  return cachedDrafts;
}

export function getServerDraftsSnapshot(): DraftRecord[] {
  return EMPTY_DRAFTS;
}
