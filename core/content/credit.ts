// The credit lines shown under a picture or recording, built from what content_items stores.
// Every adapter's attribution repeats the title, creator and date, so it isn't shown again; only
// the Met's accession number and credit line are taken from it. Commons fields are cleaned of what
// the file page carries along: the edit trail ("derivative work: Przykuta → [edit]"), the source
// file's name, Wikidata codes after a date, and an upload time. A recording keeps the work's date
// with the composer, apart from the performance (docs/08, "Review of the 2c rebuild").

export type CreditInput = {
  type: string;
  title: string;
  creator: string | null;
  date: string | null;
  source: string | null; // content_sources.name
  license: string;
  attribution: string | null;
};

export type Credit = { title: string; lines: string[] };

const MET = "The Metropolitan Museum of Art";

export function cleanCreator(creator: string | null): { creator: string | null; derivative: boolean } {
  if (!creator) return { creator: null, derivative: false };
  let s = creator.replace(/→/g, " ").replace(/\[edit\]/gi, " ");
  s = s.replace(/^\S[^:]*\.(?:jpe?g|png|gif|tiff?|svg|webp|ogg|oga|opus|flac|wav|mp3|webm):\s*/i, ""); // "Nile_River_Delta_at_Night.JPG: "
  const derivative = /\bderivative work\b/i.test(s);
  s = s.replace(/[\s,;]*\bderivative work\b.*$/i, ""); // the editor who cropped it, not the maker
  s = s.replace(/\s+/g, " ").trim().replace(/[,;:]$/, "").trim();
  if (/^(no idea|unknown)\b.*\bsee source\b/i.test(s)) s = "";
  return { creator: s || null, derivative };
}

export function cleanDate(date: string | null): string | null {
  if (!date) return null;
  let s = date.replace(/date QS:.*$/i, ""); // "1903date QS:P571,+1903-00-00T00:00:00Z/9"
  s = s.replace(/\s*\(sources?:.*\)\s*$/i, "");
  s = s.replace(/^(\d{4}-\d{2}-\d{2})[ T]\d{1,2}:\d{2}(?::\d{2})?$/, "$1"); // an upload or camera time
  s = s.replace(/\s+/g, " ").trim();
  return s || null;
}

export function credit(item: CreditInput): Credit {
  const { creator, derivative } = cleanCreator(item.creator);
  // A derivative file's date is when it was edited, not when the picture was made.
  let date = derivative ? null : cleanDate(item.date);

  let maker = creator;
  let performance: string | null = null;
  if (item.type === "audio" && creator) {
    const split = creator.match(/^(?:composed by\s+)?(.+?)[\s,;]+performed by\s+(.+)$/i);
    if (split) {
      maker = split[1].trim();
      const performer = split[2].trim();
      // "Composed 1913 Performed 2006" gives both; a single date with a named performer is the work's.
      const dates = date?.match(/^composed\s+(.+?)\s+performed\s+(.+)$/i);
      if (dates) date = dates[1];
      performance = `Performed by ${performer}${dates ? `, ${dates[2]}` : ""}`;
    }
  }

  let source = item.source;
  if (source === MET && item.attribution) {
    const details = item.attribution.match(/The Metropolitan Museum of Art, (.+)$/)?.[1].replace(/\.+$/, "");
    if (details) source = `${MET}, ${details}`;
  }

  const lines = [
    [maker, date].filter(Boolean).join(", "),
    performance,
    [source, item.license].filter(Boolean).join(" · "),
  ].filter((l): l is string => !!l);
  return { title: item.title, lines };
}
