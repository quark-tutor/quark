import { getJson, type Adapter, type ContentType } from "./types.ts";

// Wikimedia Commons: one file by its title ("File:Rosetta Stone.JPG"). The license comes from the
// file's own page, through imageinfo extmetadata. https://www.mediawiki.org/wiki/API:Imageinfo

type Meta = Record<string, { value: string } | undefined>;
type CommonsReply = {
  query: {
    pages: {
      title: string;
      missing?: boolean;
      imageinfo?: { url: string; thumburl?: string; mime: string; mediatype: string; descriptionurl: string; extmetadata: Meta }[];
    }[];
  };
};

// Wikimedia keeps an MP3 of each sound file, which iPad Safari plays where it may not play Ogg. Used by the
// week page and the Wonder Wall's player.
export const commonsMp3 = (url: string) => {
  const m = url.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(\w\/\w\w)\/([^/]+\.(?:ogg|oga|opus|flac|wav))$/);
  return m ? `https://upload.wikimedia.org/wikipedia/commons/transcoded/${m[1]}/${m[2]}/${m[2]}.mp3` : null;
};

const entities: Record<string, string> = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&#039;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };

// extmetadata values are HTML; keep the text.
export function plain(html: string | undefined): string {
  return (html ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&(amp|quot|#0?39|lt|gt|nbsp);/g, (e) => entities[e] ?? e)
    // A link to another wiki keeps its prefix as text: "the w:United States Marine Corps Band".
    .replace(/(^|[\s(])(?:w|wikt|wikipedia|en|d|c|s):(?=\S)/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

// Drop Commons' tracking parameters from upload URLs.
const clean = (url: string) => url.split("?")[0];

const types: Record<string, ContentType> = { BITMAP: "image", DRAWING: "image", AUDIO: "audio", VIDEO: "video" };

export const fetchCommons: Adapter = async (externalId) => {
  if (!externalId.startsWith("File:")) throw new Error(`Commons id must start with File:, got "${externalId}"`);
  const params = new URLSearchParams({
    action: "query",
    titles: externalId,
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|mediatype",
    iiurlwidth: "1280",
    format: "json",
    formatversion: "2",
  });
  const reply = (await getJson(`https://commons.wikimedia.org/w/api.php?${params}`)) as CommonsReply;
  const page = reply.query.pages[0];
  const info = page?.imageinfo?.[0];
  if (!page || page.missing || !info) throw new Error(`Commons file "${externalId}" not found`);
  const m = info.extmetadata;
  const type = types[info.mediatype];
  if (!type) throw new Error(`Commons file "${externalId}" is ${info.mediatype}, which Quark doesn't use`);
  const license = plain(m.LicenseShortName?.value) || "unknown";
  const creator = plain(m.Artist?.value) || null;
  const title = plain(m.ObjectName?.value) || page.title.replace(/^File:/, "").replace(/\.[^.]+$/, "");
  return {
    title,
    creator,
    type,
    url: clean(info.url),
    thumbnail_url: type === "image" && info.thumburl ? clean(info.thumburl) : null,
    license,
    attribution: `${[creator, title].filter(Boolean).join(". ")}. ${license}. Wikimedia Commons.`,
    metadata: {
      page_url: info.descriptionurl,
      date: plain(m.DateTimeOriginal?.value) || undefined,
      description: plain(m.ImageDescription?.value) || undefined,
      tags: [],
      mime: info.mime,
      attribution_required: m.AttributionRequired?.value === "true",
    },
    isPublicDomain: m.License?.value === "pd" || /^cc0/i.test(license),
  };
};
