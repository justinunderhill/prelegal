import { getActiveOwner, subscribeToAuthChanges } from "./auth/client";
import { syncDraft, syncDraftRemoval } from "./documentSync";

export interface DraftRecord {
  slug: string;
  agreementName: string;
  values: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  ownerEmail: string;
}

const STORAGE_KEY = "prelegal_drafts_v1";
const DRAFTS_CHANGED_EVENT = "prelegal:drafts-changed";
const EMPTY_DRAFTS: DraftRecord[] = [];

let cachedDraftsJson = "";
let cachedOwnerId = "";
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

function getDraftKey(ownerId: string, slug: string): string {
  return `${ownerId}:${slug}`;
}

function withOwner(record: DraftRecord): DraftRecord {
  if (record.ownerId) return record;
  const owner = getActiveOwner();
  return { ...record, ownerId: owner.id, ownerEmail: owner.email };
}

function writeDraftMap(drafts: Record<string, DraftRecord>): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  cachedDraftsJson = "";
  cachedOwnerId = "";
  notifyDraftsChanged();
}

function sortDrafts(drafts: DraftRecord[]): DraftRecord[] {
  return drafts.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function isNewerThan(a: string, b?: string): boolean {
  if (!b) return true;
  return new Date(a).getTime() > new Date(b).getTime();
}

export function getDraft(slug: string): DraftRecord | null {
  const owner = getActiveOwner();
  const drafts = readDraftMap();
  const draft = drafts[getDraftKey(owner.id, slug)] ?? drafts[slug];
  const ownedDraft = draft ? withOwner(draft) : null;
  return ownedDraft?.ownerId === owner.id ? ownedDraft : null;
}

export function getAllDrafts(): DraftRecord[] {
  const owner = getActiveOwner();
  return sortDrafts(
    Object.values(readDraftMap())
      .map(withOwner)
      .filter((draft) => draft.ownerId === owner.id)
  );
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
  const owner = getActiveOwner();
  const draftKey = getDraftKey(owner.id, slug);
  const existing = drafts[draftKey] ?? drafts[slug];
  const draft: DraftRecord = {
    slug,
    agreementName,
    values,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    ownerId: owner.id,
    ownerEmail: owner.email,
  };

  delete drafts[slug];
  drafts[draftKey] = draft;
  writeDraftMap(drafts);
  syncDraft(draft);
  return draft;
}

export function removeDraft(slug: string): void {
  const owner = getActiveOwner();
  const drafts = readDraftMap();
  const draftKey = getDraftKey(owner.id, slug);
  if (!drafts[draftKey] && !drafts[slug]) return;
  delete drafts[draftKey];
  delete drafts[slug];
  writeDraftMap(drafts);
  syncDraftRemoval(owner.id, slug);
}

export function mergeDraftsFromRemote(remoteDrafts: DraftRecord[]): void {
  if (!canUseStorage() || remoteDrafts.length === 0) return;

  const drafts = readDraftMap();
  let changed = false;

  for (const remoteDraft of remoteDrafts) {
    const draftKey = getDraftKey(remoteDraft.ownerId, remoteDraft.slug);
    const existing = drafts[draftKey] ?? drafts[remoteDraft.slug];
    const ownedExisting = existing ? withOwner(existing) : null;

    if (!ownedExisting || isNewerThan(remoteDraft.updatedAt, ownedExisting.updatedAt)) {
      delete drafts[remoteDraft.slug];
      drafts[draftKey] = remoteDraft;
      changed = true;
    }
  }

  if (changed) writeDraftMap(drafts);
}

export function subscribeToDrafts(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) onStoreChange();
  }

  window.addEventListener(DRAFTS_CHANGED_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);
  const unsubscribeFromAuth = subscribeToAuthChanges(onStoreChange);

  return () => {
    window.removeEventListener(DRAFTS_CHANGED_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
    unsubscribeFromAuth();
  };
}

export function getDraftsSnapshot(): DraftRecord[] {
  if (!canUseStorage()) return EMPTY_DRAFTS;

  const owner = getActiveOwner();
  const nextJson = window.localStorage.getItem(STORAGE_KEY) ?? "{}";
  if (nextJson !== cachedDraftsJson || owner.id !== cachedOwnerId) {
    cachedDraftsJson = nextJson;
    cachedOwnerId = owner.id;
    cachedDrafts = getAllDrafts();
  }

  return cachedDrafts;
}

export function getServerDraftsSnapshot(): DraftRecord[] {
  return EMPTY_DRAFTS;
}
