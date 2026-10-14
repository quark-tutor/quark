import { fetchAic } from "./aic.ts";
import { fetchCommons } from "./commons.ts";
import { fetchMet } from "./met.ts";
import { fetchMusopen } from "./musopen.ts";
import type { Adapter } from "./types.ts";

// The plan names each item by its page URL; this turns one into a content_sources slug and the
// external id its adapter takes.

export const ADAPTERS: Record<string, Adapter> = { met: fetchMet, aic: fetchAic, commons: fetchCommons, musopen: fetchMusopen };

export type SourceRef = { source: string; externalId: string };

const patterns: [string, RegExp, (m: RegExpMatchArray) => string][] = [
  ["met", /^https:\/\/www\.metmuseum\.org\/art\/collection\/search\/(\d+)\/?$/, (m) => m[1]],
  ["aic", /^https:\/\/www\.artic\.edu\/artworks\/(\d+)(\/.*)?$/, (m) => m[1]],
  ["commons", /^https:\/\/commons\.wikimedia\.org\/wiki\/(File:[^?#]+)$/, (m) => decodeURIComponent(m[1]).replace(/_/g, " ")],
  ["musopen", /^https:\/\/musopen\.org\/music\/(\d+-[a-z0-9-]+)\/?$/, (m) => m[1]],
];

export function sourceRef(url: string): SourceRef {
  for (const [source, re, id] of patterns) {
    const m = url.match(re);
    if (m) return { source, externalId: id(m) };
  }
  throw new Error(`No content source knows the URL ${url}`);
}

// Where the stored copy lives in the content bucket: <source>/<external_id>.<ext>, made safe.
export function storagePath(source: string, externalId: string, ext: string): string {
  const name = externalId
    .replace(/^File:/, "")
    .replace(/\.[A-Za-z0-9]+$/, "")
    .replace(/[^A-Za-z0-9._-]+/g, "_");
  return `${source}/${name}.${ext}`;
}
