// What every source adapter returns for one item: the fields of a content_items row, plus whether
// the source itself says the item is public domain.

export type ContentType = "image" | "audio" | "text" | "simulation" | "map" | "video";

export type FetchedItem = {
  title: string;
  creator: string | null;
  type: ContentType;
  url: string; // the original: the full image, or the audio file
  thumbnail_url: string | null; // a smaller image, for the model to look at and the review page
  license: string;
  attribution: string;
  metadata: { page_url: string; date?: string; description?: string; tags?: string[] } & Record<string, unknown>;
  isPublicDomain: boolean;
};

export type Adapter = (externalId: string, known?: { title?: string }) => Promise<FetchedItem>;

// Sent with every request: Wikimedia requires a descriptive one, and AIC asks for its own header.
export const USER_AGENT = "Quark/0.1 (https://github.com/quark-tutor/quark)";

export async function getJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, ...headers } });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}
