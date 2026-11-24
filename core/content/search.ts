import { getJson, USER_AGENT } from "./types.ts";

// Searching the open sources for the app's own lesson writer (docs/week-without-hands-slice.md, stop 1, 2): the
// Met's Collection API (its v1.1 search; v1 was retired on 1 Oct 2026), the Art Institute of Chicago's search,
// and Wikimedia Commons' file search. Each returns page URLs in the form the plan names an item by, so the item is
// then fetched through its real adapter (core/content/sources.ts) and its license read exactly as content:fetch
// reads it. Nothing here decides a license; the caller does, from what the adapter returns. Musopen is never
// searched: its site refuses automated requests, and it is checked by hand.

// A dropped connection is tried once more before it counts (tonight's content:fetch stopped twice on one,
// 23 Nov 2026); anything else fails at once.
export async function retryOnce<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (!(e instanceof TypeError)) throw e; // fetch's network failure is a TypeError ("fetch failed")
    await new Promise((r) => setTimeout(r, 1500));
    return fn();
  }
}

const get = (url: string, headers: Record<string, string> = {}) => retryOnce(() => getJson(url, headers));

export const metPage = (id: number | string) => `https://www.metmuseum.org/art/collection/search/${id}`;
export const aicPage = (id: number | string) => `https://www.artic.edu/artworks/${id}`;
// sourceRef() reads the title back with decodeURIComponent and underscores as spaces.
export const commonsPage = (title: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title.replace(/^File:/, "").replace(/ /g, "_"))}`;

export async function searchMet(query: string, n = 4): Promise<string[]> {
  const params = new URLSearchParams({ q: query, hasImages: "true", isPublicDomain: "true", limit: String(n), offset: "0" });
  const reply = (await get(`https://collectionapi.metmuseum.org/public/collection/v1.1/search?${params}`)) as { objectIDs?: number[] | null };
  return (reply.objectIDs ?? []).slice(0, n).map(metPage);
}

export async function searchAic(query: string, n = 4): Promise<string[]> {
  const params = new URLSearchParams({ q: query, "query[term][is_public_domain]": "true", fields: "id,image_id", limit: String(n) });
  const reply = (await get(`https://api.artic.edu/api/v1/artworks/search?${params}`, { "AIC-User-Agent": USER_AGENT })) as {
    data?: { id: number; image_id: string | null }[];
  };
  return (reply.data ?? []).filter((a) => a.image_id).slice(0, n).map((a) => aicPage(a.id));
}

// A Commons file found by a search, with the templates on its page, which say on what grounds it is public domain.
export type CommonsHit = { url: string; templates: string[] };

export async function searchCommons(query: string, kind: "image" | "audio", n = 4): Promise<CommonsHit[]> {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `${query} filetype:${kind === "audio" ? "audio" : "bitmap"}`,
    gsrnamespace: "6",
    gsrlimit: String(n),
    prop: "templates",
    tlnamespace: "10",
    tllimit: "max",
    format: "json",
    formatversion: "2",
  });
  const reply = (await get(`https://commons.wikimedia.org/w/api.php?${params}`)) as {
    query?: { pages?: { title: string; index?: number; templates?: { title: string }[] }[] };
  };
  return (reply.query?.pages ?? [])
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((p) => ({ url: commonsPage(p.title), templates: (p.templates ?? []).map((t) => t.title) }));
}

// A recording is used only when it is public domain in the US (decided 1 Nov 2026): its Commons page carries CC0,
// or a template that names the US ground (PD-USGov…, PD-US…, PD-USMC), and no template saying it is not public
// domain in the US ("Not-PD-US-record-expired-min-year" on an Edison record, read 23 Nov 2026).
export function usPublicDomainRecording(templates: string[]): boolean {
  const names = templates.map((t) => t.replace(/^Template:/, ""));
  if (names.some((t) => /^Not-PD-US/i.test(t))) return false;
  return names.some((t) => /^(PD-USGov|PD-US(\b|-)|PD-USMC|Cc-zero|CC0)/i.test(t));
}

// The reference the writer may use beside the items' own records: the English Wikipedia article on the idea, as
// plain text. It is read, never shown, linked or copied in (Brandon's go, 23 Nov 2026). Null when there is no such
// article, or it is a page of meanings.
export type Reference = { title: string; url: string; text: string };
export const REFERENCE_CHARS = 14_000; // about 3,500 tokens: the article's opening sections
export const SECOND_CHARS = 8_000; // a second article, on the idea's mechanism, is cut shorter

export async function wikipediaArticle(title: string, chars = REFERENCE_CHARS): Promise<Reference | null> {
  const params = new URLSearchParams({ action: "query", prop: "extracts", explaintext: "1", redirects: "1", titles: title, format: "json", formatversion: "2" });
  const reply = (await get(`https://en.wikipedia.org/w/api.php?${params}`)) as { query?: { pages?: { title: string; missing?: boolean; extract?: string }[] } };
  const page = reply.query?.pages?.[0];
  const text = page?.extract?.trim();
  if (!page || page.missing || !text || text.length < 400) return null;
  if (/\bmay refer to:/i.test(text.slice(0, 400))) return null;
  return {
    title: page.title,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
    text: text.length > chars ? `${text.slice(0, chars)}…` : text,
  };
}

// The idea's own article, and a second one on its mechanism where the idea names one (the Montgolfier brothers'
// article never says why warm air rises; "Hot air balloon" does): one text, each under its own heading. Null when
// the first is missing; a missing second is left out.
export async function wikipediaArticles(titles: string[]): Promise<Reference | null> {
  const [first, second] = titles.filter((t) => t.trim());
  if (!first) return null;
  const main = await wikipediaArticle(first);
  if (!main) return null;
  const more = second && second.toLowerCase() !== first.toLowerCase() ? await wikipediaArticle(second, SECOND_CHARS) : null;
  if (!more || more.title === main.title) return main;
  return { title: `${main.title}" and "${more.title}`, url: main.url, text: `${main.text}\n\n--- The article "${more.title}" ---\n\n${more.text}` };
}
