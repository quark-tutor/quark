import type { Adapter } from "./types.ts";

// Musopen is checked by hand: its site refuses automated requests (403), so nothing is fetched.
// The item is recorded from what the plan says, with its license unconfirmed, and waits for a
// guardian to check the recording's page and approve it.

export const fetchMusopen: Adapter = async (externalId, known) => {
  if (!/^\d+-[a-z0-9-]+$/.test(externalId)) {
    throw new Error(`Musopen id looks like 5871-israel-in-egypt-hwv-54, got "${externalId}"`);
  }
  const url = `https://musopen.org/music/${externalId}/`;
  const title = known?.title ?? externalId.replace(/^\d+-/, "").replace(/-/g, " ");
  return {
    title,
    creator: null,
    type: "audio",
    url,
    thumbnail_url: null,
    license: "unconfirmed",
    attribution: `${title}. Musopen.`,
    metadata: { page_url: url, description: "Checked by hand: confirm the recording's license and performer on Musopen." },
    isPublicDomain: false,
  };
};
