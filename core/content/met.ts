import { getJson, type Adapter } from "./types.ts";

// The Met Collection API: one object by its objectID. CC0 when isPublicDomain is true.
// https://metmuseum.github.io/

type MetObject = {
  objectID: number;
  isPublicDomain: boolean;
  primaryImage: string;
  primaryImageSmall: string;
  title: string;
  artistDisplayName: string;
  culture: string;
  objectDate: string;
  objectName: string;
  medium: string;
  creditLine: string;
  accessionNumber: string;
  objectURL: string;
  tags: { term: string }[] | null;
  message?: string;
};

export const fetchMet: Adapter = async (externalId) => {
  if (!/^\d+$/.test(externalId)) throw new Error(`Met object id must be a number, got "${externalId}"`);
  const o = (await getJson(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${externalId}`)) as MetObject;
  if (!o.objectID) throw new Error(`Met object ${externalId}: ${o.message ?? "not found"}`);
  if (!o.primaryImage) throw new Error(`Met object ${externalId} has no image`);
  const creator = o.artistDisplayName || o.culture || null;
  return {
    title: o.title,
    creator,
    type: "image",
    url: o.primaryImage,
    thumbnail_url: o.primaryImageSmall || null,
    license: o.isPublicDomain ? "CC0" : "not open access",
    attribution: `${[creator, o.title, o.objectDate].filter(Boolean).join(". ")}. The Metropolitan Museum of Art, ${o.accessionNumber}, ${o.creditLine}.`,
    metadata: {
      page_url: o.objectURL,
      date: o.objectDate,
      description: [o.objectName, o.medium].filter(Boolean).join("; "),
      tags: (o.tags ?? []).map((t) => t.term),
      accession: o.accessionNumber,
    },
    isPublicDomain: o.isPublicDomain,
  };
};
