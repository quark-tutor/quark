import { getJson, USER_AGENT, type Adapter } from "./types.ts";

// The Art Institute of Chicago API: one artwork by id, images through IIIF. CC0 when
// is_public_domain is true. AIC asks for an AIC-User-Agent header and the 843-pixel image size.
// https://api.artic.edu/docs/

type AicArtwork = {
  data: {
    id: number;
    title: string;
    artist_display: string | null;
    date_display: string | null;
    image_id: string | null;
    is_public_domain: boolean;
    credit_line: string | null;
    copyright_notice: string | null;
    short_description: string | null;
    term_titles: string[] | null;
  };
  config: { iiif_url: string; website_url: string };
};

const FIELDS =
  "id,title,artist_display,date_display,image_id,is_public_domain,credit_line,copyright_notice,short_description,term_titles";

export const fetchAic: Adapter = async (externalId) => {
  if (!/^\d+$/.test(externalId)) throw new Error(`AIC artwork id must be a number, got "${externalId}"`);
  const { data: a, config } = (await getJson(`https://api.artic.edu/api/v1/artworks/${externalId}?fields=${FIELDS}`, {
    "AIC-User-Agent": USER_AGENT,
  })) as AicArtwork;
  if (!a.image_id) throw new Error(`AIC artwork ${externalId} has no image`);
  const image = (width: number) => `${config.iiif_url}/${a.image_id}/full/${width},/0/default.jpg`;
  const creator = a.artist_display?.split("\n")[0] || null;
  return {
    title: a.title,
    creator,
    type: "image",
    url: image(843),
    thumbnail_url: image(400),
    license: a.is_public_domain ? "CC0" : a.copyright_notice || "not public domain",
    attribution: `${[creator, a.title, a.date_display].filter(Boolean).join(". ")}. The Art Institute of Chicago.`,
    metadata: {
      page_url: `${config.website_url}/artworks/${a.id}`,
      date: a.date_display ?? undefined,
      description: a.short_description ?? undefined,
      tags: [...new Set(a.term_titles ?? [])],
      credit_line: a.credit_line,
    },
    isPublicDomain: a.is_public_domain,
  };
};
