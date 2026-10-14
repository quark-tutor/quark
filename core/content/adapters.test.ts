import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchAic } from "./aic";
import { fetchCommons, plain } from "./commons";
import { fetchMet } from "./met";
import { fetchMusopen } from "./musopen";
import { sourceRef, storagePath } from "./sources";

// Each fixture is one real API response, recorded 13 Oct 2026.
const fixture = (name: string) => JSON.parse(readFileSync(join(__dirname, "fixtures", name), "utf8"));

function serve(body: unknown, status = 200) {
  const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("met", () => {
  it("maps an open-access object", async () => {
    const fetchMock = serve(fixture("met-548438.json"));
    const item = await fetchMet("548438");
    expect(fetchMock.mock.calls[0][0]).toBe("https://collectionapi.metmuseum.org/public/collection/v1/objects/548438");
    expect(item).toMatchObject({
      title: "East Wall, South Side of Nakht's Offering Chapel",
      creator: "Norman de Garis Davies",
      type: "image",
      url: "https://images.metmuseum.org/CRDImages/eg/original/DP-44690-001.jpg",
      thumbnail_url: "https://images.metmuseum.org/CRDImages/eg/web-large/DP-44690-001.jpg",
      license: "CC0",
      isPublicDomain: true,
    });
    expect(item.metadata).toMatchObject({ page_url: "https://www.metmuseum.org/art/collection/search/548438", tags: ["Animals", "Men", "Agriculture", "Working"] });
    expect(item.attribution).toContain("The Metropolitan Museum of Art, 15.5.19b");
  });

  it("names the object when the Met says it isn't there", async () => {
    serve({ message: "Not a valid object" }, 404);
    await expect(fetchMet("1")).rejects.toThrow(/answered 404/);
  });
});

describe("aic", () => {
  it("maps a public-domain artwork to IIIF images and sends the AIC header", async () => {
    const fetchMock = serve(fixture("aic-27992.json"));
    const item = await fetchAic("27992");
    const [, init] = fetchMock.mock.calls[0];
    expect((init!.headers as Record<string, string>)["AIC-User-Agent"]).toMatch(/^Quark/);
    expect(item).toMatchObject({
      title: "A Sunday on La Grande Jatte — 1884",
      creator: "Georges Seurat (French, 1859–1891)",
      url: "https://www.artic.edu/iiif/2/2d484387-2509-5e8e-2c43-22f9981972eb/full/843,/0/default.jpg",
      thumbnail_url: "https://www.artic.edu/iiif/2/2d484387-2509-5e8e-2c43-22f9981972eb/full/400,/0/default.jpg",
      license: "CC0",
      isPublicDomain: true,
    });
    expect(item.metadata.page_url).toBe("https://www.artic.edu/artworks/27992");
    expect(new Set(item.metadata.tags).size).toBe(item.metadata.tags!.length);
  });
});

describe("commons", () => {
  it("maps a public-domain image, reading the license from extmetadata", async () => {
    const fetchMock = serve(fixture("commons-rhind.json"));
    const item = await fetchCommons("File:Rhind Mathematical Papyrus.jpg");
    const [url, init] = fetchMock.mock.calls[0];
    expect(new URL(url).searchParams.get("titles")).toBe("File:Rhind Mathematical Papyrus.jpg");
    expect((init!.headers as Record<string, string>)["User-Agent"]).toMatch(/^Quark\/\S+ \(https:/);
    expect(item).toMatchObject({
      title: "Rhind Mathematical Papyrus",
      type: "image",
      url: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Rhind_Mathematical_Papyrus.jpg",
      license: "Public domain",
      isPublicDomain: true,
    });
    expect(item.creator).not.toContain("<");
  });

  it("maps an audio file to its URL with no thumbnail", async () => {
    serve(fixture("commons-aida.json"));
    const item = await fetchCommons("File:Triumphal March from Aida.ogg");
    expect(item).toMatchObject({
      type: "audio",
      url: "https://upload.wikimedia.org/wikipedia/commons/3/32/Triumphal_March_from_Aida.ogg",
      thumbnail_url: null,
      license: "Public domain",
    });
  });

  it("strips HTML from extmetadata", () => {
    expect(plain('unknown (<a href="x">c. 2000 B.C</a>) &amp; more')).toBe("unknown (c. 2000 B.C) & more");
    // The Aida file's Artist field links the band to Wikipedia as "w:United States Marine Corps Band".
    expect(plain('Giuseppe Verdi, performed by the <a href="https://en.wikipedia.org/wiki/United_States_Marine_Corps_Band">w:United States Marine Corps Band</a>')).toBe(
      "Giuseppe Verdi, performed by the United States Marine Corps Band",
    );
    expect(plain("Time: 10:30, ratio 3:4")).toBe("Time: 10:30, ratio 3:4");
  });
});

describe("musopen", () => {
  it("fetches nothing and waits for a person", async () => {
    const fetchMock = serve({});
    const item = await fetchMusopen("5871-israel-in-egypt-hwv-54", { title: "Israel in Egypt, HWV 54 (Handel)" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(item).toMatchObject({ type: "audio", license: "unconfirmed", isPublicDomain: false, title: "Israel in Egypt, HWV 54 (Handel)" });
  });
});

describe("sourceRef", () => {
  it("reads the source and external id from each kind of plan URL", () => {
    expect(sourceRef("https://www.metmuseum.org/art/collection/search/548438")).toEqual({ source: "met", externalId: "548438" });
    expect(sourceRef("https://www.artic.edu/artworks/27992/a-sunday-on-la-grande-jatte-1884")).toEqual({ source: "aic", externalId: "27992" });
    expect(sourceRef("https://commons.wikimedia.org/wiki/File:Rosetta_Stone.JPG")).toEqual({ source: "commons", externalId: "File:Rosetta Stone.JPG" });
    expect(sourceRef("https://musopen.org/music/5871-israel-in-egypt-hwv-54/")).toEqual({ source: "musopen", externalId: "5871-israel-in-egypt-hwv-54" });
    expect(() => sourceRef("https://example.org/x")).toThrow(/No content source/);
  });

  it("makes a safe storage path", () => {
    expect(storagePath("commons", "File:Rosetta Stone.JPG", "jpg")).toBe("commons/Rosetta_Stone.jpg");
    expect(storagePath("met", "548438", "jpg")).toBe("met/548438.jpg");
  });
});
