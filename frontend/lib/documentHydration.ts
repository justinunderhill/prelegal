import { User } from "./auth/types";
import { fetchRemoteDocuments, RemoteDocumentRecord } from "./documentSync";
import { DraftRecord, mergeDraftsFromRemote } from "./drafts";
import { ExportRecord, mergeExportsFromRemote } from "./exportHistory";

function toDraftRecord(record: RemoteDocumentRecord, user: User): DraftRecord {
  return {
    slug: record.slug,
    agreementName: record.agreement_name,
    values: record.values,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    ownerId: record.owner_id,
    ownerEmail: user.email,
  };
}

function toExportRecord(record: RemoteDocumentRecord, user: User): ExportRecord {
  return {
    id: record.id,
    slug: record.slug,
    agreementName: record.agreement_name,
    fileName: record.file_name ?? `${record.slug}-draft.pdf`,
    exportedAt: record.exported_at ?? record.updated_at,
    ownerId: record.owner_id,
    ownerEmail: user.email,
  };
}

export async function hydrateDocumentsForUser(user: User): Promise<void> {
  const records = await fetchRemoteDocuments(user.id);
  if (records.length === 0) return;

  mergeDraftsFromRemote(
    records
      .filter((record) => record.status === "draft")
      .map((record) => toDraftRecord(record, user))
  );

  mergeExportsFromRemote(
    records
      .filter((record) => record.status === "exported")
      .map((record) => toExportRecord(record, user))
  );
}
