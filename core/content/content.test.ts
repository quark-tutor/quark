import { beforeEach, describe, expect, it, vi } from "vitest";
import { decide, isOpenLicense, type Flag } from "./rule";
import { extensionFor, STORE_MAX_BYTES, syncItem, type Row, type SyncDeps } from "./sync";
import type { FetchedItem } from "./types";

const complete = vi.hoisted(() => vi.fn());
vi.mock("server-only", () => ({}));
vi.mock("../model.ts", () => ({ complete }));
const { flagItem } = await import("./flag");

describe("the approval rule", () => {
  it("approves CC0 or public domain with no flags, and nothing else", () => {
    expect(decide({ source: "met", license: "CC0", flags: [] })).toEqual({ approved: true, approved_how: "auto", status: "approved" });
    expect(decide({ source: "commons", license: "Public domain", flags: [] }).approved).toBe(true);
    expect(decide({ source: "met", license: "CC0", flags: ["frightening"] })).toMatchObject({ approved: false, status: "pending" });
    expect(decide({ source: "commons", license: "CC BY-SA 4.0", flags: [] })).toMatchObject({ approved: false, status: "pending" });
    expect(decide({ source: "met", license: "not open access", flags: [] }).approved).toBe(false);
  });

  it("never approves a source that is checked by hand", () => {
    expect(decide({ source: "musopen", license: "Public domain", flags: [] })).toEqual({ approved: false, approved_how: null, status: "manual" });
  });

  it("reads open licenses strictly", () => {
    expect(isOpenLicense("CC0 1.0")).toBe(true);
    expect(isOpenLicense("public domain")).toBe(true);
    expect(isOpenLicense("CC BY 4.0")).toBe(false);
    expect(isOpenLicense("Not public domain")).toBe(false);
    expect(isOpenLicense("unconfirmed")).toBe(false);
  });
});

const image: FetchedItem = {
  title: "Cat Statuette",
  creator: null,
  type: "image",
  url: "https://images.example.org/original/cat.jpg",
  thumbnail_url: "https://images.example.org/small/cat.jpg",
  license: "CC0",
  attribution: "Cat Statuette. The Met.",
  metadata: { page_url: "https://www.metmuseum.org/art/collection/search/544118", date: "332–30 BCE", tags: ["Cats"] },
  isPublicDomain: true,
};

describe("flagItem", () => {
  beforeEach(() => complete.mockReset());

  it("asks the gate model with the image and the source's words, and keeps only known flags", async () => {
    complete.mockResolvedValue({ flags: ["frightening", "spooky", "frightening"], note: " A bronze cat. " });
    const bytes = new Uint8Array([1]);
    const result = await flagItem(image, { data: bytes, mediaType: "image/jpeg" });
    expect(result).toEqual({ flags: ["frightening"], note: "A bronze cat." });
    const call = complete.mock.calls[0][0];
    expect(call.use).toBe("gate");
    expect(call.images).toEqual([{ data: bytes, mediaType: "image/jpeg" }]);
    expect(call.prompt).toContain("Title: Cat Statuette");
    expect(call.prompt).toContain("Tags from the source: Cats");
    expect(call.system).toContain("frightening");
    expect(call.json.properties.flags.items.enum).toEqual(["nudity", "violence", "frightening", "needs_review"]);
  });
});

// An in-memory content_items table and bucket, to run the sync twice.
function fakeDeps(item: FetchedItem, flags: Flag[] = []) {
  const rows = new Map<string, Row>();
  const uploads: string[] = [];
  const deps = {
    existing: vi.fn<SyncDeps["existing"]>(async ({ source, externalId }) => {
      const row = rows.get(`${source}/${externalId}`);
      return row ? { title: row.title, license: row.license, flags: row.flags, approved: row.approved, rejected_at: null } : null;
    }),
    fetchItem: vi.fn<SyncDeps["fetchItem"]>(async () => item),
    download: vi.fn<SyncDeps["download"]>(async (url) => ({ data: new Uint8Array(url.length), contentType: "image/jpeg" })),
    flag: vi.fn<SyncDeps["flag"]>(async () => ({ flags, note: "A note." })),
    upload: vi.fn<SyncDeps["upload"]>(async (path) => void uploads.push(path)),
    save: vi.fn<SyncDeps["save"]>(async (row) => void rows.set(`${row.source}/${row.external_id}`, row)),
  } satisfies SyncDeps;
  return { deps, rows, uploads };
}

describe("syncItem", () => {
  const ref = { source: "met", externalId: "544118" };

  it("fetches, stores a copy, flags from the thumbnail and approves an open, unflagged image", async () => {
    const { deps, rows, uploads } = fakeDeps(image);
    const result = await syncItem(ref, { title: "Cat" }, deps);
    expect(result).toEqual({ item: "Cat Statuette", license: "CC0", flags: [], status: "approved", changed: true });
    expect(uploads).toEqual(["met/544118.jpg"]);
    expect(deps.download.mock.calls.map((c) => c[0])).toEqual([image.url, image.thumbnail_url]);
    expect(deps.flag.mock.calls[0][1]).toMatchObject({ mediaType: "image/jpeg" });
    expect(rows.get("met/544118")).toMatchObject({
      approved: true,
      approved_how: "auto",
      url: image.url,
      metadata: { storage_path: "met/544118.jpg", flag_note: "A note.", page_url: image.metadata.page_url },
    });
  });

  it("stores the source's preview instead of an original too big for Storage, and says so", async () => {
    const { deps, rows, uploads } = fakeDeps(image);
    deps.download.mockImplementation(async (url) => ({ data: new Uint8Array(url === image.url ? STORE_MAX_BYTES + 1 : 10), contentType: "image/jpeg" }));
    await syncItem(ref, { title: "Cat" }, deps);
    expect(deps.download.mock.calls.map((c) => c[0])).toEqual([image.url, image.thumbnail_url]);
    expect(deps.upload.mock.calls[0][1].data.byteLength).toBe(10);
    expect(uploads).toEqual(["met/544118.jpg"]);
    expect(rows.get("met/544118")).toMatchObject({ url: image.url, metadata: { storage_path: "met/544118.jpg", stored_from: "preview" } });
  });

  it("changes nothing the second time, and doesn't call the source, storage or model again", async () => {
    const { deps } = fakeDeps(image);
    await syncItem(ref, {}, deps);
    for (const fn of Object.values(deps)) fn.mockClear();
    const again = await syncItem(ref, {}, deps);
    expect(again).toMatchObject({ status: "approved", changed: false });
    expect(deps.fetchItem).not.toHaveBeenCalled();
    expect(deps.download).not.toHaveBeenCalled();
    expect(deps.flag).not.toHaveBeenCalled();
    expect(deps.upload).not.toHaveBeenCalled();
    expect(deps.save).not.toHaveBeenCalled();
  });

  it("leaves a flagged image pending, but still keeps its copy", async () => {
    const { deps, rows } = fakeDeps(image, ["violence"]);
    const result = await syncItem(ref, {}, deps);
    expect(result.status).toBe("pending");
    expect(rows.get("met/544118")).toMatchObject({ approved: false, approved_how: null, flags: ["violence"] });
    expect(deps.upload).toHaveBeenCalledOnce();
  });

  it("stores only the URL of an audio item and flags it from its text", async () => {
    const audio: FetchedItem = { ...image, type: "audio", url: "https://upload.example.org/march.ogg", thumbnail_url: null, license: "Public domain" };
    const { deps, rows } = fakeDeps(audio);
    await syncItem({ source: "commons", externalId: "File:March.ogg" }, {}, deps);
    expect(deps.download).not.toHaveBeenCalled();
    expect(deps.flag.mock.calls[0][1]).toBeUndefined();
    expect(rows.get("commons/File:March.ogg")?.metadata.storage_path).toBeUndefined();
  });

  it("doesn't ask the model about a source checked by hand", async () => {
    const audio: FetchedItem = { ...image, type: "audio", thumbnail_url: null, license: "unconfirmed" };
    const { deps } = fakeDeps(audio);
    const result = await syncItem({ source: "musopen", externalId: "5871-israel-in-egypt-hwv-54" }, {}, deps);
    expect(result.status).toBe("manual");
    expect(deps.flag).not.toHaveBeenCalled();
  });

  it("stops and names the item when a fetch fails", async () => {
    const { deps } = fakeDeps(image);
    deps.download.mockRejectedValueOnce(new Error("https://images.example.org/original/cat.jpg answered 503"));
    await expect(syncItem(ref, { title: "Cat Statuette intended to contain a mummified cat" }, deps)).rejects.toThrow(
      /^Cat Statuette intended to contain a mummified cat: .*answered 503/,
    );
    expect(deps.save).not.toHaveBeenCalled();
  });

  it("reports a rejected item as rejected", async () => {
    const { deps } = fakeDeps(image);
    deps.existing.mockResolvedValueOnce({ title: "Cat", license: "CC0", flags: [], approved: false, rejected_at: "2026-10-13T00:00:00Z" });
    expect((await syncItem(ref, {}, deps)).status).toBe("rejected");
  });
});

describe("extensionFor", () => {
  it("prefers the content type, then the URL", () => {
    expect(extensionFor("image/jpeg; charset=binary", "x")).toBe("jpg");
    expect(extensionFor("application/octet-stream", "https://x.org/a/Rosetta_Stone.JPG?u=1")).toBe("jpg");
  });
});
