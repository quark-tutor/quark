import type { FlagResult } from "./flag.ts";
import { CHECK_BY_HAND, decide, type Status } from "./rule.ts";
import { ADAPTERS, storagePath, type SourceRef } from "./sources.ts";
import type { FetchedItem } from "./types.ts";

// One plan item into content_items: fetch it, keep a copy of its image, have the model tag it,
// apply the approval rule, save. An item already in the table is left alone, so running again
// changes nothing. The database, storage and model come in as deps so this can be tested.

export type Existing = { title: string | null; license: string; flags: string[]; approved: boolean; rejected_at: string | null };

export type Row = {
  source: string;
  external_id: string;
  type: FetchedItem["type"];
  title: string;
  creator: string | null;
  url: string;
  thumbnail_url: string | null;
  license: string;
  attribution: string;
  approved: boolean;
  approved_how: "auto" | null;
  flags: string[];
  metadata: Record<string, unknown>;
};

export type Download = { data: Uint8Array; contentType: string };

export type SyncDeps = {
  existing: (ref: SourceRef) => Promise<Existing | null>;
  fetchItem: (ref: SourceRef, known: { title?: string }) => Promise<FetchedItem>;
  download: (url: string) => Promise<Download>;
  flag: (item: FetchedItem, image?: { data: Uint8Array; mediaType: ModelImageType }) => Promise<FlagResult>;
  upload: (path: string, file: Download) => Promise<void>;
  save: (row: Row) => Promise<void>;
};

export type SyncResult = {
  item: string;
  license: string;
  flags: string[];
  status: Status | "rejected";
  changed: boolean;
};

type ModelImageType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
const MODEL_TYPES = new Set<string>(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const MODEL_MAX_BYTES = 5 * 1024 * 1024; // the model API's limit for one image
// Storage takes at most 50 MB a file, and the wall never needs a 30,000-pixel scan (the Van Gogh
// Museum's Bedroom on Commons, 16 Oct 2026). Past this size the stored copy is the source's large
// preview (1280 pixels wide for Commons) instead of the original.
export const STORE_MAX_BYTES = 20 * 1024 * 1024;

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp", "image/tiff": "tif" };

const mime = (contentType: string) => contentType.split(";")[0].trim().toLowerCase();

export function extensionFor(contentType: string, url: string): string {
  return EXT[mime(contentType)] ?? url.split("?")[0].match(/\.([A-Za-z0-9]+)$/)?.[1]?.toLowerCase() ?? "bin";
}

export function existingStatus(source: string, row: Existing): Status | "rejected" {
  if (row.rejected_at) return "rejected";
  if (row.approved) return "approved";
  return CHECK_BY_HAND.has(source) ? "manual" : "pending";
}

export const fetchFromSource: SyncDeps["fetchItem"] = (ref, known) => {
  const adapter = ADAPTERS[ref.source];
  if (!adapter) throw new Error(`No adapter for source ${ref.source}`);
  return adapter(ref.externalId, known);
};

export async function syncItem(ref: SourceRef, known: { title?: string }, deps: SyncDeps): Promise<SyncResult> {
  const label = `${ref.source} ${ref.externalId}`;
  const found = await deps.existing(ref);
  if (found) {
    return { item: found.title ?? label, license: found.license, flags: found.flags, status: existingStatus(ref.source, found), changed: false };
  }

  try {
    const item = await deps.fetchItem(ref, known);
    const metadata: Record<string, unknown> = { ...item.metadata };
    let image: { data: Uint8Array; mediaType: ModelImageType } | undefined;

    if (item.type === "image") {
      const original = await deps.download(item.url);
      const preview = item.thumbnail_url && item.thumbnail_url !== item.url ? item.thumbnail_url : null;
      const tooBig = original.data.byteLength > STORE_MAX_BYTES && preview;
      const stored = tooBig ? await deps.download(preview) : original;
      const path = storagePath(ref.source, ref.externalId, extensionFor(stored.contentType, tooBig ? preview : item.url));
      await deps.upload(path, stored);
      metadata.storage_path = path;
      if (tooBig) metadata.stored_from = "preview";

      const look = tooBig ? stored : preview ? await deps.download(preview) : original;
      if (MODEL_TYPES.has(mime(look.contentType)) && look.data.byteLength <= MODEL_MAX_BYTES) {
        image = { data: look.data, mediaType: mime(look.contentType) as ModelImageType };
      }
    }

    let flags: string[] = [];
    if (CHECK_BY_HAND.has(ref.source)) {
      metadata.flag_note = "Not checked by the model: this source is checked by hand.";
    } else {
      const result = await deps.flag(item, image);
      flags = result.flags;
      metadata.flag_note = result.note;
    }

    const { approved, approved_how, status } = decide({ source: ref.source, license: item.license, flags });
    await deps.save({
      source: ref.source,
      external_id: ref.externalId,
      type: item.type,
      title: item.title,
      creator: item.creator,
      url: item.url,
      thumbnail_url: item.thumbnail_url,
      license: item.license,
      attribution: item.attribution,
      approved,
      approved_how,
      flags,
      metadata,
    });
    return { item: item.title, license: item.license, flags, status, changed: true };
  } catch (e) {
    throw new Error(`${known.title ?? label}: ${e instanceof Error ? e.message : String(e)}`);
  }
}
