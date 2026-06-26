import type { DraftRecord } from "./drafts";
import type { ExportRecord } from "./exportHistory";

type RuntimeLocation = Pick<Location, "hostname" | "port">;

export interface RemoteDocumentRecord {
  id: string;
  owner_id: string;
  slug: string;
  agreement_name: string;
  status: "draft" | "exported";
  values: Record<string, unknown>;
  file_name: string | null;
  created_at: string;
  updated_at: string;
  exported_at: string | null;
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getApiBaseUrl(location?: RuntimeLocation): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return trimTrailingSlash(configuredBaseUrl);
  }

  const runtimeLocation =
    location ?? (typeof window !== "undefined" ? window.location : undefined);

  if (runtimeLocation) {
    const { hostname, port } = runtimeLocation;
    const isLocalFrontend =
      (hostname === "localhost" || hostname === "127.0.0.1") &&
      (port === "3000" || port === "3001");

    if (isLocalFrontend) {
      return "http://localhost:8000";
    }
  }

  return "";
}

function documentsApiUrl(path = ""): string {
  return `${getApiBaseUrl()}/api/documents${path}`;
}

function canSyncOwner(ownerId: string): boolean {
  return ownerId !== "anonymous" && typeof fetch !== "undefined";
}

async function safeRequest(url: string, init: RequestInit): Promise<void> {
  try {
    const response = await fetch(url, init);
    if (!response.ok) {
      console.warn(`Document sync failed (${response.status})`);
    }
  } catch {
    // Local document storage remains the source of truth when offline.
  }
}

export async function fetchRemoteDocuments(ownerId: string): Promise<RemoteDocumentRecord[]> {
  if (!canSyncOwner(ownerId)) return [];

  const params = new URLSearchParams({ owner_id: ownerId });
  try {
    const response = await fetch(documentsApiUrl(`?${params}`));
    if (!response.ok) {
      console.warn(`Document hydration failed (${response.status})`);
      return [];
    }
    const records = await response.json();
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

export function syncDraft(draft: DraftRecord): void {
  if (!canSyncOwner(draft.ownerId)) return;

  void safeRequest(documentsApiUrl(`/drafts/${draft.slug}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_id: draft.ownerId,
      slug: draft.slug,
      agreement_name: draft.agreementName,
      values: draft.values,
    }),
  });
}

export function syncDraftRemoval(ownerId: string, slug: string): void {
  if (!canSyncOwner(ownerId)) return;

  const params = new URLSearchParams({ owner_id: ownerId });
  void safeRequest(documentsApiUrl(`/drafts/${slug}?${params}`), {
    method: "DELETE",
  });
}

export function syncExport(record: ExportRecord): void {
  if (!canSyncOwner(record.ownerId)) return;

  void safeRequest(documentsApiUrl("/exports"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_id: record.ownerId,
      slug: record.slug,
      agreement_name: record.agreementName,
      file_name: record.fileName,
    }),
  });
}

export function syncExportRemoval(ownerId: string, documentId: string): void {
  if (!canSyncOwner(ownerId)) return;

  const params = new URLSearchParams({ owner_id: ownerId });
  void safeRequest(documentsApiUrl(`/exports/${documentId}?${params}`), {
    method: "DELETE",
  });
}
