# Short lessons for week 3: forty candidates

Written 7 Nov 2026 by Claude Code, step 1 of `docs/week-3-slice.md`. A proposal: nothing imported, nothing built.
Brandon and June pick 28; step 2 writes those into `plan/short-lessons.yaml` (summaries, sources, values points),
and this file stays as the record of why each was offered.

Twelve are the ones week 2 did not take (`plan/candidates/short-lessons-2.md`, numbers 7, 8, 14, 15, 16, 23, 24,
29, 31, 32, 39, 40), each checked again and re-numbered here; 28 are new.

## How many of each, and on which day

Week 3 is the family's week 3 of the plan: Egypt topics 15 to 21 on the thread, which sit on look, listen, then,
puzzle, then, wonder, look. So week 3 needs **look 5, wonder 6, listen 6, then 5, puzzle 6**. A lesson's place in
its slot decides its day:

| Day | Date | Egypt (thread) | look | wonder | listen | then | puzzle |
|---|---|---|---|---|---|---|---|
| 1 | Mon 9 Nov | look: the weighing of the heart, canopic jars and the cats of Bastet | **Egypt** | 1st | 1st | 1st | 1st |
| 2 | Tue 10 Nov | listen: Handel's Israel in Egypt | 1st | 2nd | **Egypt** | 2nd | 2nd |
| 3 | Wed 11 Nov (Veterans Day) | then: Isis and Osiris, and the cat in Egypt | 2nd | 3rd | 2nd | **Egypt** | 3rd |
| 4 | Thu 12 Nov | puzzle: a balance scale, and a cartouche for your name | 3rd | 4th | 3rd | 3rd | **Egypt** |
| 5 | Fri 13 Nov | then: scribes, the Rosetta Stone and Tutankhamun's tomb | 4th | 5th | 4th | **Egypt** | 4th |
| 6 | Sat 14 Nov | wonder: how papyrus is made, and how archaeologists date what they find | 5th | **Egypt** | 5th | 4th | 5th |
| 7 | Sun 15 Nov | look: Tutankhamun's time, scribes' palettes, and what tomb walls were for | **Egypt** | 6th | 6th | 5th | 6th |

**Veterans Day** lands on Wednesday as the second listen: Taps (18). Wednesday's then is
Egypt's, so Veterans Day could only be the second look or the second listen; a bugle call is a real music idea with
a US Army Band recording, where a photograph would be a picture of war with less to teach. **Nellie Bly** (28) is
fourth in then so that it lands on Saturday 14 November, the day she set off in 1889.

Monday's cards show on the wall only if the week is tapped before the boys' Monday session; the Sunday build has
the week in review by Sunday evening.

Each slot below lists eight in the order I'd run them; **the ones marked ★ are the 28 I'd take**, in that order:
the first five of look, the first six of the other four. The rest stay here for week 4 or later.

## How the candidates were found

As for week 2: the Met (Collection API search; its old search address was retired on 1 October 2026 and v1.1 is
used, while the object address the adapter reads still answers), the Art Institute of Chicago and Wikimedia Commons
(file search, with each file's own license). The search code was a throwaway in the session's scratch folder and is
not in the repository. Every item below was then fetched through the real adapters (`core/content/sources.ts`), so
its id and license are the ones `content:fetch` will see: **all 69 came back CC0 or public domain**, and none is
Musopen's own site. Each still goes through the flag model at `content:fetch`, and anything it flags waits at
`/parent/content`. The doubtful pictures were looked at, not just listed: Merian's banana plate (caterpillar, pupa
and moth all shown), Rackham's crow, the 1881 Oʻahu map (its scale and scale bar) and Knibb's clock dial (IIII).

The rules, as before: CC0 or public domain only; no nudity; nothing frightening for a 7-year-old; a real object,
artwork, place or recording before a modern illustration; a recording for a listen lesson. **A recording is taken
only when it is public domain in the US**: a US government recording, one made or published in 1925 or earlier, or
one released as CC0. A Commons "public domain" tag is not enough for a recording: a 1940 Berlin recording of the
Pizzicato Polka is tagged public domain there but is protected in the US until 2041, so it is not offered.

**What the school's tests lean on** (decided 22 Oct) and where it lands: time (17, 36, 38), length (35, 37),
capacity (34), multiplication (33), word parts (19, 26, 27), a fable (29), biographies (1, 10, 20, 22, 25, 28); for
the younger, a picture to describe in full sentences (the look slot, 1-8) and plain informational text (the wonder
slot, 9-16). No bar graph this week: weeks 1 and 2 had two.

**Hawaiʻi** in every slot: look 5; wonder 9, 13, 15; listen 19; then 26, 32; puzzle 35, 37. There is no open
recording of Hawaiian music on Commons besides Frank Ferera's guitar duets, and week 2's steel guitar used one, so
Hawaiʻi's listen lesson is the ʻokina (19), with a CC0 recording of ʻOumuamua said in Hawaiian.

**Values points.** One is marked: Taps (18), point 20 (violence and war), perspective `several_fairly`: it names
the First World War's end, and nothing of the fighting. Which way the family's settings take it shows in
`week:build --plan` before anything is spent (step 3 on test; the plan on live at stop 2); a lesson the live
settings hold back in code is swapped before the Sunday build, not after. Left out of summaries, as Pele and the
1893 overthrow were: the piko holes at Puʻuloa (5), where families placed a newborn's cord for a long life; how
old Triceratops is (27; how-fossils-form carried point 5 for the age of the Earth); the words of the St. Louis
Blues (22), a grown-up's sad song about someone who left town.

**Close to weeks 1 and 2, said plainly.** 12 (a cell, Hooke's cork) is near week 1's tiny-animals-in-water
(Leeuwenhoek's microscope); the idea here is the cell. 11 (countershading) shares nothing with an earlier week. 27
(tri-) is a second word part after week 2's tele-; tele- was a root, this is a prefix. 29 (the crow) is a third
fable after the boy who cried wolf and the tortoise and the hare; the idea here is displacement, not a moral. 17
(tempo) and 38 (base sixty) both count to sixty, on Monday and Sunday. No candidate repeats an earlier idea name.

**The twelve from week 2, checked again.** All twelve are kept; none repeats an idea weeks 1 and 2 used, and each
still fits the school leanings or the season. Their lines are below in their slots, each with a *Kept* line.

---

## look

### 1. ★ Tue. leyster-self-portrait: A self-portrait: Judith Leyster paints herself at work (art)

- **Teaches:** about 1630 Judith Leyster painted herself at her easel, turning to us mid-stroke with a brush in her
  hand; in 1633 she joined the painters' guild of Haarlem, one of very few women in it; after she died her pictures
  were sold as Frans Hals's, until 1893, when her mark, the letters JL with a star, was found on one. For the
  younger: describing a picture in full sentences.
- **The idea named:** a self-portrait.
- **Picture:** `commons-leyster-self-portrait-nga`: Commons, *Judith Leyster, Self-Portrait, c. 1630, NGA 37003.jpg*.
  https://commons.wikimedia.org/wiki/File:Judith_Leyster,_Self-Portrait,_c._1630,_NGA_37003.jpg. CC0 (National
  Gallery of Art). Large and crisp: the painter, smiling, with the painting she is working on, a fiddler.
- **Values points:** none.

### 2. ★ Wed. escaping-criticism: Trompe l'oeil: the boy who climbs out of the frame (art)

- **Teaches:** in Pere Borrell del Caso's Escaping Criticism (Spain, 1874) a boy seems to climb out of a picture
  frame into our room, gripping the edge with his hands and stepping out with one foot; a picture painted to fool
  the eye is called trompe l'oeil, French for "fool the eye".
- **The idea named:** trompe l'oeil.
- **Picture:** `commons-borrell-escaping-criticism`: Commons, *Flucht vor der Kritik, Pere Borrell del Caso -
  9626.jpg*. https://commons.wikimedia.org/wiki/File:Flucht_vor_der_Kritik,_Pere_Borrell_del_Caso_-_9626.jpg.
  Public domain (a 2024 photograph of the 1874 painting, which is in the Bank of Spain's collection in Madrid).
- **Values points:** none.

### 3. ★ Thu. edouart-silhouettes: A silhouette: a whole scene cut from black paper (art)

- **Teaches:** Auguste Edouart, a Frenchman who worked in Britain and America, cut likenesses freehand from black
  paper with scissors; here Kate and Harry Lucas play with a dog and a bird. A silhouette shows only the outline,
  and still you can tell what everyone is doing. The word comes from the name of a French minister, Étienne de
  Silhouette; why is told in different ways. For the younger: describing a picture in full sentences.
- **The idea named:** a silhouette.
- **Pictures:** `met-edouart-kate-and-harry-lucas`: The Met 786115, *Kate and Harry Lucas, playing with a dog and a
  bird*, Auguste Edouart, 1826-49. https://www.metmuseum.org/art/collection/search/786115. CC0. Cut paper.
  `met-edouart-magic-lantern`: The Met 365307, *The Magic Lantern*, Auguste Edouart, about 1835.
  https://www.metmuseum.org/art/collection/search/365307. CC0. A second scene.
- **Values points:** none.

### 4. ★ Fri. netsuke-hare: A miniature: a whole hare carved small enough to hide in a hand (art)

- **Teaches:** a kimono has no pockets, so in Japan a pouch hung from the sash on a cord, held in place by a small
  carved toggle called a netsuke; Minkō carved this seated hare from wood and horn, every bit of fur, small enough to
  close a hand around. Something made very small and complete is a miniature.
- **The idea named:** a miniature.
- **Picture:** `met-netsuke-seated-hare-minko`: The Met 59676, *Netsuke of a Seated Hare*, Minkō, late 18th to early
  19th century. https://www.metmuseum.org/art/collection/search/59676. CC0.
- **Values points:** none.

### 5. ★ Sat. puuloa-petroglyphs: A petroglyph: pictures pecked into lava at Puʻuloa (art; Hawaiʻi)

- **Teaches:** at Puʻuloa, in Hawaiʻi Volcanoes National Park, more than 23,000 pictures were pecked into hardened
  lava with hard stones: circles, dots, people and canoes; a picture made in rock that way is a petroglyph. Their
  makers left no written key, so we look closely and wonder what each one meant. For the younger: describing what
  is in the picture.
- **The idea named:** a petroglyph.
- **Pictures:** `commons-nps-puuloa-petroglyphs-a`: Commons, *Petroglyphs at Pu'uloa in Hawai'i Volcanoes National
  Park (a053f199-6686-4b71-93fb-85a47aaa76c1).JPG*.
  https://commons.wikimedia.org/wiki/File:Petroglyphs_at_Pu%27uloa_in_Hawai%27i_Volcanoes_National_Park_(a053f199-6686-4b71-93fb-85a47aaa76c1).JPG.
  Public domain (National Park Service, 2012). `commons-nps-puuloa-petroglyphs-b`: Commons, *Petroglyphs at Pu'uloa
  in Hawai'i Volcanoes National Park (eba7619c-6e53-46fb-8520-2ae0736c7540).JPG*.
  https://commons.wikimedia.org/wiki/File:Petroglyphs_at_Pu%27uloa_in_Hawai%27i_Volcanoes_National_Park_(eba7619c-6e53-46fb-8520-2ae0736c7540).JPG.
  Public domain (National Park Service, 2012).
- **Values points:** none. (The piko holes, where families placed a newborn's cord for a long life, are left out
  of the summary.)

### 6. copley-paul-revere: Clues in a portrait: Paul Revere with his teapot (art)

- **Teaches:** John Singleton Copley painted Paul Revere about 1768 in his shirtsleeves at his work table, holding a
  silver teapot, with the tools for engraving it beside him; every object is a clue to what the man did: he was a
  silversmith. His hand is reflected in the polished table.
- **The idea named:** clues in a portrait.
- **Picture:** `commons-copley-paul-revere`: Commons, *J S Copley - Paul Revere.jpg*.
  https://commons.wikimedia.org/wiki/File:J_S_Copley_-_Paul_Revere.jpg. Public domain (Museum of Fine Arts, Boston).
- **Values points:** none. (His ride of 1775 belongs to the Revolution, point 18's ground; the summary stays with
  the silversmith.)

### 7. rousseau-jungle: Self-taught: Henri Rousseau painted jungles he never saw (art)

- **Teaches:** Rousseau was a Paris toll collector who taught himself to paint; people laughed at his pictures,
  he kept going, and he painted jungles from the plants in Paris's glasshouses and gardens without ever leaving
  France.
- **The idea named:** self-taught.
- **Picture:** `commons-rousseau-equatorial-jungle-nga`: Commons, *Henri Rousseau, The Equatorial Jungle, 1909,
  NGA 46688.jpg*. https://commons.wikimedia.org/wiki/File:Henri_Rousseau,_The_Equatorial_Jungle,_1909,_NGA_46688.jpg.
  CC0 (National Gallery of Art). Thick leaves and flowers, with a monkey and a bird hiding in them; no tiger.
- **Values points:** none.
- **Kept** (week 2's 7): Dürer's rhinoceros, in week 2, was the artist who drew what he had never seen; this one's
  idea is teaching yourself, and the summary leans on that.

### 8. ruysch-flowers: Still life, and the flowers that never bloomed together (art)

- **Teaches:** Rachel Ruysch, one of the best-paid painters of her day, painted bouquets of flowers that bloom in
  different seasons, each painted from life on its own and put together in the picture; tiny insects hide among
  them.
- **The idea named:** still life.
- **Picture:** `commons-ruysch-flowers-marble-rijksmuseum`: Commons, *Stilleven met bloemen op een marmeren
  tafelblad, SK-A-2338.jpg*. https://commons.wikimedia.org/wiki/File:Stilleven_met_bloemen_op_een_marmeren_tafelblad,_SK-A-2338.jpg.
  CC0 (Rijksmuseum). Flowers in a glass vase on a marble table, 1716.
- **Values points:** none.
- **Kept** (week 2's 8): nothing in weeks 1 or 2 is near it.

## wonder

### 9. ★ Mon. kolea-migration: Migration: the kōlea flies from Alaska to Hawaiʻi (science; Hawaiʻi)

- **Teaches:** every August and September the kōlea, the Pacific golden plover, flies about 3,000 miles from Alaska
  to Hawaiʻi over open ocean without stopping, in about three days, and in April it flies back north to nest; many
  come back to the same lawn or field every year. A journey made every year with the seasons is a migration.
- **The idea named:** migration.
- **Pictures:** `commons-usfws-pacific-golden-plover`: Commons, *Pacific golden plover (7123153921).jpg*.
  https://commons.wikimedia.org/wiki/File:Pacific_golden_plover_(7123153921).jpg. Public domain (US Fish and
  Wildlife Service). `commons-usfws-pluvialis-fulva`: Commons, *Pluvialis fulvaUSFWS003413A.jpg*.
  https://commons.wikimedia.org/wiki/File:Pluvialis_fulvaUSFWS003413A.jpg. Public domain (O. W. Johnson, USFWS). Small
  (765 by 602). The best kōlea photos on Commons, taken on Maui, are CC BY, so not offered.
- **Values points:** none.

### 10. ★ Tue. merian-metamorphosis: Metamorphosis: Maria Sibylla Merian draws a caterpillar's whole life (science)

- **Teaches:** a caterpillar becomes a pupa and then a butterfly or moth, a change called metamorphosis; Maria
  Sibylla Merian raised caterpillars and drew each stage on the plant it eats, and in 1699, at 52, she sailed to
  Suriname in South America with her daughter to draw the insects there, for her book of 1705. Her elder daughter,
  Johanna Helena, drew the poppy with its caterpillar, pupa and butterfly.
- **The idea named:** metamorphosis.
- **Pictures:** `met-herolt-poppy-metamorphosis`: The Met 366733, *A Poppy in Three Stages of Flowering, with a
  Caterpillar, Pupa and Butterfly*, Johanna Helena Herolt (née Graff), late 17th to early 18th century.
  https://www.metmuseum.org/art/collection/search/366733. CC0. `commons-merian-banana-1705`: Commons, *Maria Sibylla
  Merian Banana Flower and Fruit, from Metamorphosis insectorum Surinamensium 1705.jpg*.
  https://commons.wikimedia.org/wiki/File:Maria_Sibylla_Merian_Banana_Flower_and_Fruit,_from_Metamorphosis_insectorum_Surinamensium_1705.jpg.
  Public domain. A banana flower with a green caterpillar, a dark red pupa and the moth, all on one plate.
- **Values points:** none.

### 11. ★ Wed. countershading: Countershading: why so many animals are dark on top and pale underneath (science)

- **Teaches:** Abbott Thayer, an American painter, noticed that many animals are darker on the back and paler
  underneath; light from above brightens the back and shades the belly, so the two cancel out and the animal looks
  flat and hard to see, a kind of camouflage called countershading. In his 1909 book the same caterpillar shows up
  plainly when it is turned upside down.
- **The idea named:** countershading.
- **Pictures:** `commons-thayer-luna-caterpillar-1909`: Commons, *Thayer Concealing-Coloration Plate XII - Luna
  Caterpillar a) in position b) inverted.jpg*.
  https://commons.wikimedia.org/wiki/File:Thayer_Concealing-Coloration_Plate_XII_-_Luna_Caterpillar_a)_in_position_b)_inverted.jpg.
  Public domain (1909). The caterpillar twice, the right way up and upside down. `commons-thayer-white-fowl-1909`:
  Commons, *White fowl lacking counter-shading from Thayer 1909.jpg*.
  https://commons.wikimedia.org/wiki/File:White_fowl_lacking_counter-shading_from_Thayer_1909.jpg. Public domain.
- **Values points:** none.

### 12. ★ Thu. hooke-cells: A cell: Robert Hooke looks at cork (science)

- **Teaches:** in 1665 Robert Hooke sliced cork very thin and looked at it through his microscope: rows of tiny
  boxes, which he called cells, after small rooms; every living thing is made of cells, and the cork's were the
  empty walls of dead ones.
- **The idea named:** a cell.
- **Pictures:** `commons-hooke-micrographia-schem-11`: Commons, *Micrographia Schem 11.jpg*.
  https://commons.wikimedia.org/wiki/File:Micrographia_Schem_11.jpg. Public domain (1665). Hooke's own engraving of
  the cork. `commons-hooke-cork-cells`: Commons, *Cork Micrographia Hooke.png*.
  https://commons.wikimedia.org/wiki/File:Cork_Micrographia_Hooke.png. Public domain. The cells, closer.
- **Values points:** none.

### 13. ★ Fri. coral-polyps: A polyp: coral is an animal (science; Hawaiʻi)

- **Teaches:** a coral reef is built by tiny animals called polyps, relatives of jellyfish and sea anemones; each
  builds a cup of limestone around itself, and many live joined together as one coral; most reef corals have tiny
  algae living inside them that make food from sunlight, so they grow in clear, shallow water. This coral is at
  French Frigate Shoals, in the Northwestern Hawaiian Islands.
- **The idea named:** a polyp.
- **Picture:** `commons-noaa-acropora-ffs`: Commons, *Acropora coral ffs.jpg*.
  https://commons.wikimedia.org/wiki/File:Acropora_coral_ffs.jpg. Public domain (Andy Collins, NOAA, 2005).
- **Values points:** none.

### 14. ★ Sun. autumn-leaves: Chlorophyll: why leaves turn red and gold in the fall (science)

- **Teaches:** leaves are green because of chlorophyll, which makes food from sunlight; in the fall many trees stop
  making it, the green fades, and the yellows and oranges that were there all along show through; Hawaiʻi has few
  trees that do this.
- **The idea named:** chlorophyll.
- **Pictures:** `aic-tosa-autumn-maples`: The Art Institute of Chicago 127644, *Autumn Maples with Poem Slips*, Tosa
  Mitsuoki, about 1675. https://www.artic.edu/artworks/127644. CC0. Red maple leaves on gold. `aic-inness-autumn-woods`:
  AIC 64736, *Autumn Woods*, George Inness, 1891-94. https://www.artic.edu/artworks/64736. CC0.
- **Values points:** none.
- **Kept** (week 2's 16), and taken this week: Sunday 15 November is the middle of the fall.

### 15. seeds-to-hawaii: Seed dispersal: how plants reached islands in the middle of the ocean (science; Hawaiʻi)

- **Teaches:** Hawaiʻi's first plants arrived by wind, wings and waves: tiny seeds blown on the wind, seeds stuck
  to or eaten by birds, and seeds that float; later, voyagers brought canoe plants like the coconut and taro.
- **The idea named:** seed dispersal.
- **Picture:** `commons-nps-sprouted-coconut-kaimu`: Commons, *Visitor Planting Sprouted Coconut, Kaimu,
  Hawaii.jpg*. https://commons.wikimedia.org/wiki/File:Visitor_Planting_Sprouted_Coconut,_Kaimu,_Hawaii.jpg.
  Public domain. A sprouted coconut being planted on black sand.
- **Values points:** none.
- **Kept** (week 2's 14): near week 1's wayfinding only in its last line.

### 16. compass-north: A magnetic field: why a compass points north (science)

- **Teaches:** the Earth is a giant magnet, and a compass needle is a small magnet that turns to line up with it;
  in 1600 William Gilbert showed it with a round magnet he called a little Earth.
- **The idea named:** a magnetic field.
- **Pictures:** `commons-gilbert-terrella`: Commons, *Gilbert De Magnete Illo039.jpg*.
  https://commons.wikimedia.org/wiki/File:Gilbert_De_Magnete_Illo039.jpg. Public domain (1600). The round magnet.
  `commons-gilbert-needles`: Commons, *Gilbert De Magnete Illo011.jpg*.
  https://commons.wikimedia.org/wiki/File:Gilbert_De_Magnete_Illo011.jpg. Public domain. Small needles lining up
  around it. Both are small line drawings.
- **Values points:** none.
- **Kept** (week 2's 15), last in its slot because its pictures are the weakest.

## listen

### 17. ★ Mon. metronome-tempo: Tempo: a metronome counts the beats in a minute (music)

- **Teaches:** a metronome ticks a steady beat, and its number says how many beats in one minute: 60 is one beat
  each second, 120 is two; Johann Maelzel made and sold metronomes from about 1815, and Beethoven was one of the
  first composers to write metronome numbers on his music. The speed of a piece is its tempo. The recording ticks at
  60: count it against a clock.
- **The idea named:** tempo.
- **Recording:** `commons-metronome-60bpm`: Commons, *Metronome 60bpm.wav*.
  https://commons.wikimedia.org/wiki/File:Metronome_60bpm.wav. CC0 (2023). A beep each second.
- **Picture:** `met-maelzel-metronome`: The Met 503169, *Metronome*, Johann Nepomuk Maelzel, about 1821.
  https://www.metmuseum.org/art/collection/search/503169. CC0.
- **Values points:** none.

### 18. ★ Wed (Veterans Day). taps-bugle: A bugle call: Taps, played with only four notes (music)

- **Teaches:** a bugle has no valves or keys, so a player can sound only a few notes, made by the lips alone; Taps
  uses four of them, 24 notes in all; it has been played since 1862 at the end of the day, for lights out, and at
  ceremonies honoring people who served. Veterans Day, 11 November, began as Armistice Day: the fighting of the
  First World War stopped at 11 o'clock on 11 November 1918.
- **The idea named:** a bugle call.
- **Recording:** `commons-usab-taps-on-bugle`: Commons, *Taps on bugle.ogg*.
  https://commons.wikimedia.org/wiki/File:Taps_on_bugle.ogg. Public domain (United States Army Band). Or the Marine
  Corps Band's 2012 recording, *Taps (Marine Corps Band Manual version).ogg*, also public domain.
- **Picture:** `met-key-bugle-in-c`: The Met 504065, *Bugle in C*, Thomas Key, 1811.
  https://www.metmuseum.org/art/collection/search/504065. CC0. A plain bugle with no keys.
- **Values points:** 20 (violence and war), perspective several_fairly. The summary names the war's end and
  nothing of the fighting; Taps's place at military funerals is left out.

### 19. ★ Thu. okina-oumuamua: The ʻokina: the first sound of ʻOumuamua, the visitor from another star (literature; Hawaiʻi)

- **Teaches:** the ʻokina is a letter of the Hawaiian alphabet for a short stop in the voice, like the catch in
  "uh-oh"; Hawaiian has 13 letters, five vowels and eight consonants, h, k, l, m, n, p, w and the ʻokina. On 19
  October 2017 the Pan-STARRS telescope on Haleakalā spotted the first object ever seen passing through our solar
  system from another star, and Hawaiian language experts named it ʻOumuamua, a scout or messenger from afar that
  arrives first. Listen for the ʻokina at the start of its name.
- **The idea named:** the ʻokina.
- **Recording:** `commons-haw-oumuamua`: Commons, *Haw-oumuamua.oga*. https://commons.wikimedia.org/wiki/File:Haw-oumuamua.oga.
  CC0 (2017). The name said in Hawaiian; short.
- **Pictures:** `commons-stsci-oumuamua-impression`: Commons, *Artist's Impression of `Oumuamua (2018-25-4204).png*.
  https://commons.wikimedia.org/wiki/File:Artist%E2%80%99s_Impression_of_%60Oumuamua_(2018-25-4204).png. Public
  domain (NASA, ESA and STScI, 2018). An artist's guess: the telescopes saw only a point of light.
  `commons-stsci-pan-starrs-observatory`: Commons, *Pan-STARRS Observatory (2019-12-4315).jpg*.
  https://commons.wikimedia.org/wiki/File:Pan-STARRS_Observatory_(2019-12-4315).jpg. Public domain (STScI). The
  telescope on Haleakalā.
- **Values points:** none.

### 20. ★ Fri. morse-code: Morse code: messages in short and long sounds (music; history)

- **Teaches:** Samuel Morse, a painter, worked with Alfred Vail on a code of short and long signals, dots and
  dashes, that could travel down a telegraph wire; the first long-distance message went from Washington to
  Baltimore on 24 May 1844. SOS, three short, three long, three short, was agreed in 1906 as the call for help
  because it is easy to send and hard to mistake. Tap it on a table.
- **The idea named:** Morse code.
- **Recording:** `commons-sos-morse-code`: Commons, *SOS morse code.ogg*. https://commons.wikimedia.org/wiki/File:SOS_morse_code.ogg.
  Public domain (made on a computer).
- **Picture:** `commons-brady-samuel-morse`: Commons, *Samuel F.B. Morse, inventor of the telegraph - NARA - 526779
  (cropped).jpg*. https://commons.wikimedia.org/wiki/File:Samuel_F.B._Morse,_inventor_of_the_telegraph_-_NARA_-_526779_(cropped).jpg.
  Public domain (Mathew Brady, about 1860-65; National Archives).
- **Values points:** none. (The first message's words are a Bible verse; the summary does not quote them.)

### 21. ★ Sat. pipe-organ: The pipe organ: thousands of pipes, a note for each (music)

- **Teaches:** a pipe organ is played from keyboards and pedals; each key lets air into a pipe, a long pipe for a low
  note and a short one for a high note, and big organs have thousands of pipes. The recording is the opening of the
  Toccata and Fugue in D minor, long said to be Bach's, on the organ of a French abbey; the Met's organ was built by
  Thomas Appleton in Boston in 1830.
- **The idea named:** the pipe organ.
- **Recording:** `commons-saint-antoine-organ-bwv-565`: Commons, *Saint-Antoine-l'Abbaye - Abbatiale Saint-Antoine
  - Orgue - Extrait de la Toccata et fugue en ré mineur BWV 565 de Jean-Sébastien Bach.ogg*.
  https://commons.wikimedia.org/wiki/File:Saint-Antoine-l%27Abbaye_-_Abbatiale_Saint-Antoine_-_Orgue_-_Extrait_de_la_Toccata_et_fugue_en_r%C3%A9_mineur_BWV_565_de_Jean-S%C3%A9bastien_Bach.ogg.
  CC0 (2022).
- **Picture:** `met-appleton-pipe-organ`: The Met 503670, *Pipe Organ*, Thomas Appleton, 1830.
  https://www.metmuseum.org/art/collection/search/503670. CC0. The case with its front pipes.
- **Values points:** none.

### 22. ★ Sun. st-louis-blues: Call and response: Bessie Smith sings, Louis Armstrong answers (music)

- **Teaches:** in 1925 Bessie Smith sang The St. Louis Blues, and the young Louis Armstrong answered each line she
  sang on his cornet: a voice calls and an instrument responds, like a conversation; call and response comes from
  African American work songs and runs through the blues and jazz.
- **The idea named:** call and response.
- **Recording:** `commons-smith-armstrong-st-louis-blues-1925`: Commons, *Bessie Smith and Louis Armstrong - The
  St. Louis Blues (1925).mp3*. https://commons.wikimedia.org/wiki/File:Bessie_Smith_and_Louis_Armstrong_-_The_St._Louis_Blues_(1925).mp3.
  Public domain (1925). Crackly.
- **Picture:** `commons-van-vechten-bessie-smith-1936`: Commons, *Bessie Smith (1936) by Carl Van Vechten.jpg*.
  https://commons.wikimedia.org/wiki/File:Bessie_Smith_(1936)_by_Carl_Van_Vechten.jpg. Public domain. Eleven years
  after the recording.
- **Values points:** none. (The song's words are a grown-up's sad song about someone who left town; the cards stay
  with the music. If that is not for the boys, 24 takes Sunday.)

### 23. brahms-lullaby: Triple meter: why a lullaby rocks (music)

- **Teaches:** Brahms's Lullaby counts ONE-two-three, ONE-two-three, like a cradle rocking, which is triple meter;
  a march counts in twos for walking feet.
- **The idea named:** triple meter.
- **Recording:** `commons-schumann-heink-wiegenlied-1915`: Commons, *Brahms - Schumann-Heink - Wiegenlied
  (Berceuse) (1915).ogg*. https://commons.wikimedia.org/wiki/File:Brahms_-_Schumann-Heink_-_Wiegenlied_(Berceuse)_(1915).ogg.
  Public domain (1915). Sung in German by Ernestine Schumann-Heink; crackly.
- **Values points:** none.
- **Kept** (week 2's 23).

### 24. william-tell: The overture: a whole story before the curtain opens (music)

- **Teaches:** Rossini's William Tell Overture (1829) plays before the opera starts, in four parts: dawn, a storm,
  a calm, and the famous gallop with its trumpet call; an overture opens a show.
- **The idea named:** the overture.
- **Recording:** `commons-usmb-william-tell-2000`: Commons, *Gioachino Rossini, William Tell Overture (military band
  version, 2000).ogg*. https://commons.wikimedia.org/wiki/File:Gioachino_Rossini,_William_Tell_Overture_(military_band_version,_2000).ogg.
  Public domain (United States Marine Band, 2000).
- **Values points:** none. (The opera's apple-on-the-head story is left out.)
- **Kept** (week 2's 24); the swap for 22 if the St. Louis Blues is not taken.

## then

### 25. ★ Mon. movable-type: Movable type: Gutenberg's letters that could be used again (history)

- **Teaches:** about 1450 in Mainz, Johannes Gutenberg cast each letter as its own small block of metal; the letters
  were set in rows to make a page, inked and pressed onto paper, then taken apart and used again for the next page.
  Before, every book was copied by hand.
- **The idea named:** movable type.
- **Pictures:** `commons-ipm-gutenberg-press`: Commons, *Gutenberg press.png*.
  https://commons.wikimedia.org/wiki/File:Gutenberg_press.png. CC0 (International Printing Museum). A working
  replica. `commons-amman-buchdrucker-1568`: Commons, *Buchdrucker-1568.png*.
  https://commons.wikimedia.org/wiki/File:Buchdrucker-1568.png. Public domain (Jost Amman's woodcut, 1568). Printers
  at work: one sets type, one inks, one pulls the press. Small (751 by 879).
- **Values points:** none. (His best-known book is a Bible; the summary is about the type, not the book.)

### 26. ★ Tue. humuhumu: A compound word: humuhumunukunukuāpuaʻa (literature; Hawaiʻi)

- **Teaches:** the name of Hawaiʻi's state fish is made of parts: humuhumu, a triggerfish; nukunuku, a snout; ā
  puaʻa, like a pig's; so, as the Hawaiian Dictionary gives it, a triggerfish with a snout like a pig. A word made
  of smaller words is a compound word, and English has them too: sunflower, starfish.
- **The idea named:** a compound word.
- **Picture:** `commons-si-rhinecanthus-rectangulus`: Commons, *Rhinecanthus rectangulus SI.jpg*.
  https://commons.wikimedia.org/wiki/File:Rhinecanthus_rectangulus_SI.jpg. Public domain (Sandra Raredon,
  Smithsonian Institution). The fish from the side, every stripe clear. The reef photos on Commons are CC BY.
- **Values points:** none.

### 27. ★ Thu. tri-words: A prefix: tri-, "three", from the tricycle to Triceratops (literature)

- **Teaches:** tri- means three: a triangle has three angles, a tricycle three wheels, a trio three players, and
  Triceratops, named in 1889, means "three-horned face"; knowing a prefix opens words never met before.
- **The idea named:** a prefix.
- **Pictures:** `commons-humber-tricycle-1880s`: Commons, *Viscount Bury on a Humber Roadster tricycle 1880s.jpg*.
  https://commons.wikimedia.org/wiki/File:Viscount_Bury_on_a_Humber_Roadster_tricycle_1880s.jpg. Public domain (1889).
  A grown man on a big three-wheeler. `commons-marsh-triceratops-1896`: Commons, *Triceratops prorsus old.jpg*.
  https://commons.wikimedia.org/wiki/File:Triceratops_prorsus_old.jpg. Public domain (O. C. Marsh, 1896). The
  skeleton, three horns plain.
- **Values points:** none, with no age given for Triceratops.

### 28. ★ Sat (14 Nov). nellie-bly: Circumnavigation: Nellie Bly goes around the world in 72 days (history)

- **Teaches:** on 14 November 1889 Nellie Bly, a newspaper reporter, set out from New Jersey to go around the world
  faster than Phileas Fogg, who does it in 80 days in Jules Verne's novel; by steamship and train she crossed the
  Atlantic, Europe, Asia and the Pacific, met Jules Verne in France on the way, and was back on 25 January 1890,
  after 72 days, 6 hours and 11 minutes. Going all the way around is a circumnavigation.
- **The idea named:** circumnavigation.
- **Pictures:** `commons-nellie-bly-1890`: Commons, *Nellie Bly (1864-1922) circa 1890.png*.
  https://commons.wikimedia.org/wiki/File:Nellie_Bly_(1864-1922)_circa_1890.png. Public domain (1890).
  `commons-leslies-nellie-bly-reception-1890`: Commons, *Nellie Bly Reception 1890.jpg*.
  https://commons.wikimedia.org/wiki/File:Nellie_Bly_Reception_1890.jpg. Public domain (Frank Leslie's Illustrated
  Newspaper, 8 February 1890). The crowd that met her train.
- **Values points:** none.

### 29. ★ Sun. crow-and-pitcher: Displacement: Aesop's crow, and the rooks who really did it (literature)

- **Teaches:** in Aesop's fable a thirsty crow cannot reach the water at the bottom of a pitcher, so it drops in
  pebbles one by one until the water rises to its beak; each stone pushes water out of its place, which is called
  displacement. In 2009 scientists at Cambridge gave rooks, cousins of crows, a tube of water with a worm floating
  out of reach, and the rooks dropped stones in until they could reach it.
- **The idea named:** displacement.
- **Pictures:** `commons-rackham-crow-and-pitcher`: Commons, *Aesops Fables-Rackham-059.jpg*.
  https://commons.wikimedia.org/wiki/File:Aesops_Fables-Rackham-059.jpg. Public domain (Arthur Rackham, 1912). The
  crow with a pebble in its beak beside the jug. `commons-hollar-crow-and-pitcher`: Commons, *Wenceslas Hollar - The
  crow and the pitcher (State 1).jpg*. https://commons.wikimedia.org/wiki/File:Wenceslas_Hollar_-_The_crow_and_the_pitcher_(State_1).jpg.
  Public domain (17th century etching).
- **Values points:** none.

### 30. time-zones: Time zones: why it is already tomorrow in Japan (geography)

- **Teaches:** the Earth turns once a day, so noon comes to each place at a different time; since 1883 clocks are
  set by time zones, an hour apart, counted from Greenwich in England; when it is 3 pm on Sunday in Hawaiʻi it is
  10 am on Monday in Japan, 19 hours ahead.
- **The idea named:** a time zone.
- **Pictures:** `commons-admiralty-time-zone-chart-1942`: Commons, *World Time Zone Chart 1942.jpg*.
  https://commons.wikimedia.org/wiki/File:World_Time_Zone_Chart_1942.jpg. Public domain (UK Hydrographic Office).
  `commons-shepherd-gate-clock`: Commons, *Shepherd Gate clock 2011 1.jpg*.
  https://commons.wikimedia.org/wiki/File:Shepherd_Gate_clock_2011_1.jpg. CC0. The 24-hour clock at Greenwich.
- **Values points:** none.
- **Kept** (week 2's 29, which Braille took the place of on 1 Nov). It would sit well beside Nellie Bly in a later
  week.

### 31. sequoyah: A syllabary: Sequoyah writes down Cherokee (history)

- **Teaches:** Sequoyah, who could not read English, spent about twelve years making a sign for each syllable of
  Cherokee, about 85 in all; it was so quick to learn that within a few years thousands of Cherokee could read and
  write.
- **The idea named:** a syllabary.
- **Pictures:** `commons-inman-sequoyah`: Commons, *Henry Inman - Sequoyah - Google Art Project.jpg*.
  https://commons.wikimedia.org/wiki/File:Henry_Inman_-_Sequoyah_-_Google_Art_Project.jpg. Public domain (about
  1830). `commons-king-sequoyah-1836`: Commons, *Sequoyah, Cherokee inventor, by C.B. King, 1836.jpg*.
  https://commons.wikimedia.org/wiki/File:Sequoyah,_Cherokee_inventor,_by_C.B._King,_1836.jpg. Public domain.
- **Values points:** none. (The Cherokee's forced removal in 1838 would be point 17; the summary leaves it out.)
- **Kept** (week 2's 31), not starred: week 2's Braille was also one person inventing a way to write.

### 32. iolani-lights: Electric light at ʻIolani Palace, before the White House (history; Hawaiʻi)

- **Teaches:** King Kalākaua met Thomas Edison in 1881, and ʻIolani Palace in Honolulu had electric lights in
  1886, a few years before the White House did.
- **The idea named:** electric light.
- **Pictures:** `commons-eyton-walker-iolani-palace`: Commons, *Iolani Palace, photograph by Frederick George
  Eyton-Walker, c. 1890.jpg*. https://commons.wikimedia.org/wiki/File:Iolani_Palace,_photograph_by_Frederick_George_Eyton-Walker,_c._1890.jpg.
  Public domain. `commons-cogswell-kalakaua`: Commons, *King Kalakaua painted by William Cogswell, Bishop
  Museum.jpg*. https://commons.wikimedia.org/wiki/File:King_Kalakaua_painted_by_William_Cogswell,_Bishop_Museum.jpg.
  Public domain (1876).
- **Values points:** none. (The palace's later history, the overthrow of 1893, is point 17 and is left out.)
- **Kept** (week 2's 32). Its two dates are to be checked against a source when it is written.

## puzzle

### 33. ★ Mon. estimate-a-flock: An estimate: counting a flock too big to count (math)

- **Teaches:** to count a huge flock, count the birds in one small patch, see how many patches of that size the
  flock covers, and multiply; the answer is close but not exact, an estimate, and it is how big flocks of birds are
  counted.
- **The idea named:** an estimate.
- **Picture:** `commons-usfws-snow-geese-flock`: Commons, *Flock of Snow Geese (5269142865).jpg*.
  https://commons.wikimedia.org/wiki/File:Flock_of_Snow_Geese_(5269142865).jpg. Public domain (US Fish and Wildlife
  Service). A sky full of white geese.
- **Values points:** none.

### 34. ★ Tue. quarts-and-pints: Capacity: cups, pints, quarts and gallons (math)

- **Teaches:** 2 cups make a pint, 2 pints make a quart, and 4 quarts make a gallon; a quart is a quarter of a
  gallon, which is where it got its name; how much a container holds is its capacity, and pewter measures like these
  held exactly a quart and a pint.
- **The idea named:** capacity.
- **Pictures:** `met-quart-measure`: The Met 5000, *Quart Measure*, British (for the American market), 1700-1800.
  https://www.metmuseum.org/art/collection/search/5000. CC0. `met-pint-measure`: The Met 4999, *Pint Measure*,
  1750-1800. https://www.metmuseum.org/art/collection/search/4999. CC0.
- **Values points:** none.

### 35. ★ Wed. mauna-kea-sea-level: Sea level: why Everest is the highest and Mauna Kea the tallest (math; Hawaiʻi)

- **Teaches:** mountains are measured from sea level: Mauna Kea's top is 13,803 feet above it and Everest's 29,032;
  but Mauna Kea starts on the ocean floor, and measured from its base it is about 33,500 feet, taller than Everest.
  Where you start measuring changes the answer. In 1925 government surveyors measured Mauna Kea from a station on
  its summit.
- **The idea named:** sea level.
- **Pictures:** `commons-noaa-highest-mountains`: Commons, *Comparison of Highest Mountains.jpg*.
  https://commons.wikimedia.org/wiki/File:Comparison_of_Highest_Mountains.jpg. Public domain (NOAA). The two side by
  side, with the ocean drawn in. `commons-usgs-mauna-kea-triangulation-1925`: Commons, *Harry Kawamoto and J.O.
  Kilmartin at Mauna Kea triangulation station. Hawaii. 1925.jpg*.
  https://commons.wikimedia.org/wiki/File:Harry_Kawamoto_and_J.O._Kilmartin_at_Mauna_Kea_triangulation_station._Hawaii._1925.jpg.
  Public domain (USGS, 29 October 1925).
- **Values points:** none. (What Mauna Kea's summit means to many Hawaiians, and the telescopes there, are left out.)

### 36. ★ Fri. sundial: A sundial: telling time by a shadow (math)

- **Teaches:** a sundial's slanted edge, called the gnomon, casts a shadow that moves as the sun crosses the sky,
  and the shadow points to the hour; it works only when the sun shines. Goldsmith Chandlee, an American clockmaker,
  made this one about 1800.
- **The idea named:** a sundial.
- **Picture:** `met-chandlee-sundial`: The Met 8026, *Sundial*, Goldsmith Chandlee, about 1800.
  https://www.metmuseum.org/art/collection/search/8026. CC0. A flat brass dial with its hour lines and gnomon.
- **Values points:** none.

### 37. ★ Sat. oahu-map-scale: A map scale: how far is an inch on a map of Oʻahu? (math; Hawaiʻi)

- **Teaches:** a map's scale says how far the real land is for each inch on paper; this 1881 map of Oʻahu by the
  Hawaiian Government Survey is drawn at 1 to 60,000, so one inch on it is 60,000 inches on the ground, almost a
  mile; with a ruler and the scale bar, the distance from one place to another can be measured.
- **The idea named:** a map scale.
- **Picture:** `commons-hgs-oahu-map-1881`: Commons, *Hawaiian Government Survey; W. D. Alexander, Surveyor General,
  Oahu, Hawaiian Islands; map by C. J. Lyons, ... LOC 98688461.jpg*.
  https://commons.wikimedia.org/wiki/File:Hawaiian_Government_Survey;_W._D._Alexander,_Surveyor_General,_Oahu,_Hawaiian_Islands;_map_by_C._J._Lyons,_from_trigonometic_surveys_by_W._D._Alexander,_C._J._Lyons,_J._F._Brown,_M._D._Monsarrat_and_LOC_98688461.jpg.
  Public domain (Library of Congress). Very large (16,414 by 12,400), so its preview is stored, as for other large
  originals.
- **Values points:** none. (Week 1's why-greenland-looks-huge was about a map's shape; this is about its scale.)

### 38. ★ Sun. base-sixty: Base sixty: why an hour has 60 minutes (math)

- **Teaches:** the Babylonians counted in sixties about 4,000 years ago, and we still do for time: 60 seconds, 60
  minutes; 60 splits evenly into halves, thirds, quarters, fifths, sixths, tenths and twelfths.
- **The idea named:** base sixty.
- **Pictures:** `commons-plimpton-322`: Commons, *Plimpton 322.jpg*.
  https://commons.wikimedia.org/wiki/File:Plimpton_322.jpg. Public domain per Commons. A Babylonian clay tablet of
  numbers. `met-hasius-pair-case-watch`: The Met 194091, *Pair-case watch*, Jacob Hasius, about 1695.
  https://www.metmuseum.org/art/collection/search/194091. CC0.
- **Values points:** none.
- **Kept** (week 2's 39), and taken this week, at the end of a week that counts in sixties (17, 36).

### 39. roman-numerals: Roman numerals, and the clock that writes four as IIII (math)

- **Teaches:** I, V, X, L and C are 1, 5, 10, 50 and 100; a smaller one after a bigger one adds (VI is 6) and before
  it takes away (IV is 4); many clocks write four as IIII, as Joseph Knibb's does.
- **The idea named:** Roman numerals.
- **Picture:** `commons-knibb-dial`: Commons, *Knibb-Dial.jpg*. https://commons.wikimedia.org/wiki/File:Knibb-Dial.jpg.
  Public domain. A clock dial signed by Joseph Knibb of London, with IIII at four and the minutes counted in fives.
- **Values points:** none. (A cousin of week 1's Egyptian number signs, so not starred.)

### 40. magic-square: A magic square, hidden in Dürer's print of 1514 (math)

- **Teaches:** in a magic square every row, column and diagonal adds to the same number; Dürer's 4 by 4 square adds
  to 34 every way, and its bottom row hides the year he made it, 15 and 14.
- **The idea named:** a magic square.
- **Pictures:** `commons-durer-melencolia-square`: Commons, *Albrecht Dürer - Melencolia I (detail).jpg*.
  https://commons.wikimedia.org/wiki/File:Albrecht_D%C3%BCrer_-_Melencolia_I_(detail).jpg. Public domain. Just the
  square (555 by 578). `met-durer-melencolia`: The Met 336228, *Melencolia I*, 1514.
  https://www.metmuseum.org/art/collection/search/336228. CC0. The whole print: a gloomy winged figure, so the
  detail is the better first picture.
- **Values points:** none.
- **Kept** (week 2's 40). Dürer's second appearance in two weeks if taken.
