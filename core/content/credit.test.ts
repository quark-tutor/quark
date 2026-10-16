import { describe, expect, it } from "vitest";
import { cleanDate, credit } from "./credit";

// Taken from the items stored for Ancient Egypt on 15 Oct 2026.
describe("credit", () => {
  it("leaves out a Commons file's edit trail, its source file name and the edit date", () => {
    const c = credit({
      type: "image",
      title: "Nile River Delta at Night cropped",
      creator: "Nile_River_Delta_at_Night.JPG: ISS Expedition 25 crew derivative work: Przykuta → [edit]",
      date: "2010-11-08 19:27",
      source: "Wikimedia Commons",
      license: "Public domain",
      attribution:
        "Nile_River_Delta_at_Night.JPG: ISS Expedition 25 crew derivative work: Przykuta → [edit]. Nile River Delta at Night cropped. Public domain. Wikimedia Commons.",
    });
    expect(c).toEqual({ title: "Nile River Delta at Night cropped", lines: ["ISS Expedition 25 crew", "Wikimedia Commons · Public domain"] });
  });

  it("shows the Met once, with its accession number and credit line", () => {
    const c = credit({
      type: "image",
      title: "Seated Statue of Hatshepsut",
      creator: null,
      date: "ca. 1473–1458 BCE",
      source: "The Metropolitan Museum of Art",
      license: "CC0",
      attribution: "Seated Statue of Hatshepsut. ca. 1473–1458 BCE. The Metropolitan Museum of Art, 29.3.2, Rogers Fund, 1929.",
    });
    expect(c.lines).toEqual(["ca. 1473–1458 BCE", "The Metropolitan Museum of Art, 29.3.2, Rogers Fund, 1929 · CC0"]);
  });

  it("keeps the work's date with the composer, apart from the recording", () => {
    const aida = credit({
      type: "audio",
      title: "Triumphal March from Aida",
      creator: "Giuseppe Verdi, performed by the United States Marine Corps Band, Timothy Foley, Director",
      date: "1871",
      source: "Wikimedia Commons",
      license: "Public domain",
      attribution: null,
    });
    expect(aida.lines).toEqual([
      "Giuseppe Verdi, 1871",
      "Performed by the United States Marine Corps Band, Timothy Foley, Director",
      "Wikimedia Commons · Public domain",
    ]);
    const syrinx = credit({
      type: "audio",
      title: "Debussy - Syrinx",
      creator: "Composed by Claude Debussy (1862–1918) Performed by Sarah Bassingthwaite",
      date: "Composed 1913 Performed 2006",
      source: "Wikimedia Commons",
      license: "Public domain",
      attribution: null,
    });
    expect(syrinx.lines.slice(0, 2)).toEqual(["Claude Debussy (1862–1918), 1913", "Performed by Sarah Bassingthwaite, 2006"]);
  });

  it("drops a creator that only says to see the source", () => {
    const c = credit({ type: "image", title: "Dragging a statue", creator: "No idea - see source", date: "1903", source: "Wikimedia Commons", license: "Public domain", attribution: null });
    expect(c.lines[0]).toBe("1903");
  });
});

describe("cleanDate", () => {
  it("strips Wikidata codes, source notes and times", () => {
    expect(cleanDate("1903date QS:P571,+1903-00-00T00:00:00Z/9")).toBe("1903");
    expect(cleanDate("during 1650 b.C. (sources: sapere.it (archivo), britannica.com (archive - Encyclopædia Britannica))")).toBe("during 1650 b.C.");
    expect(cleanDate("2011-11-20 18:04:40")).toBe("2011-11-20");
    expect(cleanDate("ca. 1473–1458 BCE")).toBe("ca. 1473–1458 BCE");
    expect(cleanDate("")).toBeNull();
  });
});
