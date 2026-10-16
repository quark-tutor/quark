# Short lessons: the format and a first library

Phase 3, step 2d, stage 1. A proposal, with nothing imported and nothing built. Brandon and his wife pick; stage 2 builds what they keep.

Decided 16 Oct 2026 (docs/08, "The plan: short lessons and child-chosen depth"): a week is a mix, with one slot a day for the running thread (Egypt for now) and four for short lessons; a short lesson is one idea chain on one slot, not tied to a stretch or a week; short lessons run in the plan's order until phase 4; both boys get the same ones, each card at his own level and through his own lens. The real choices left are in docs/08, "Mixed weeks: the format and the build", with the one proposed here marked.

## The format

**Stretches become threads.** `plan/ancient-egypt.yaml` keeps its weeks and topics as they are, so its summaries, sources and values points don't move. What changes is how they're used: the 24 topics run one a day, in the file's order, on the slot each was written for. The weeks inside the file become chapters of the thread (their `title` and `why` still go to the ideas prompt as context), and a week's `perspective` and `values_points` now ride on each of its topics. The comment at the top of the file and docs/04 stop saying "four weekly themes".

**Short lessons live in one library file,** `plan/short-lessons.yaml`, in the order they run:

```yaml
# Short lessons: one idea chain on one slot, not tied to a stretch or a week (docs/04).
library: short-lessons
title: Short lessons

sources:
  - id: aic-great-wave
    title: Under the Wave off Kanagawa (The Great Wave), Hokusai
    publisher: The Art Institute of Chicago, 1925.3245
    url: https://www.artic.edu/artworks/24645
    license: CC0

lessons:
  - key: great-wave            # unique, lowercase words joined by hyphens; never reused
    subject: art               # one of the seven subjects
    slot: look                 # the card it feeds
    title: The Great Wave, and how a woodblock print is made
    sources: [aic-great-wave]  # one or two, CC0 or public domain, same rules as step 2b
    values_points: []          # required: the points it touches (packs/README.md), or [] for none
    # perspective: several_fairly   # required when values_points isn't empty
    summary:
      "2-3": >-
        ...
      "4-5": >-
        ...
    # parent_note: ...         # optional, as in the Egypt plan
```

What a short lesson needs that a stretch topic doesn't: its own `key` (a stretch topic is found by week and subject, which a short lesson doesn't have), and its own `values_points` and `perspective`, which a stretch topic takes from its week. `values_points` is required even when empty, so every lesson carries an explicit answer to "does this touch a values point?" and the gate (step 5) can read it. The validator checks what it checks for stretches (subject, slot, both summaries, sources listed, https URLs, points 1-24, a perspective when there are points), plus: keys unique and well formed, `values_points` present, and at least one lesson per slot. `planWarnings()` names lessons without sources, as it does for topics.

## How the thread moves through the week

Proposed (docs/08, option a): each thread topic keeps its own slot and the topics run in the file's order, one a day. Egypt's order inside every week is then, wonder, look, listen, then, puzzle, so the thread meets every slot each week, and the other four slots take the next short lesson written for each. Week 1 of the mixed plan:

| Day | Egypt (thread) | look | wonder | listen | then | puzzle |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | then: The Nile, from source to sea | great-wave | leap-years | carnival-of-the-animals | **Egypt** | two-dice |
| 2 | wonder: Why the Nile flooded | harvesters | **Egypt** | stars-and-stripes | boy-who-cried-wolf | snowflake-six |
| 3 | look: Life on the river in Nakht's tomb | **Egypt** | new-land-from-lava | whale-song | first-flight | knights-and-knaves |
| 4 | listen: Egyptian instruments, and Verdi's Aida | audubon-birds | moon-phases | **Egypt** | why-greenland-looks-huge | doubling-grains |
| 5 | then: Ra and the sun boat | dots-that-mix | blue-sky-red-sunset | four-notes | **Egypt** | tangram |
| 6 | puzzle: Egyptian number signs | arcimboldo-faces | tiny-animals-in-water | round-and-canon | wayfinding-to-hawaii | **Egypt** |
| 7 | then: Khufu, Giza and the people who built the pyramids | van-gogh-bedroom | how-fossils-form | aloha-oe | **Egypt** | sunflower-spirals |

That needs six short lessons each for look, wonder, listen and puzzle and four for then: the 28 below, in that order. Egypt's 24 topics fill weeks 1-3 and three days of week 4; what happens after is in docs/08.

## What changes in the schema

Proposed (docs/08, option a), one migration:

- `plan_topics.kind`: `week` (a stretch's chapter row, as today), `thread` (a stretch topic) or `short` (a short lesson).
- `plan_topics.position`: a thread topic's place in its stretch (1-24 for Egypt) or a short lesson's place in the library. The day a thread topic runs comes from this, not from `week`.
- Short lessons are keyed `short/<key>/<band>`, with `week` and `parent_id` empty. Stretch keys don't change, so the day 1 already built still points at real rows.
- `themes.plan_week`: the family's week number in the plan, unique per family. A mixed week is found by it; today a theme is found by its one stretch week row, which a mixed week doesn't have. The day 1 built on 15 Oct is set to week 1 by the migration.

`ideas.topic_id`, `ideas.day` and `ideas.slot` already carry everything a mixed week needs: each day-slot's chain points at its own topic.

## What changes in week:build

- **A schedule before any model call.** A pure function (`weekSchedule()`, beside `pickLenses()`, with tests) takes the thread's topics in order, the library in order, the lessons used by earlier weeks, the week number and the number of days, and returns one topic per day and slot. Day d of week N gets thread topic 7(N-1)+d on its own slot, and each other slot gets the next unused short lesson for that slot. It stops before spending anything if a slot runs out.
- **Ideas per day-slot, not per slot.** `topicForDay()` gives way to the schedule. A chain's prompt carries its own topic's subject, both summaries, approved items and, for a thread topic, the thread's chapter (`title`, `why`). "Already written for this slot this week" becomes "already written on this topic", which for a one-day topic is nothing, and the thread's earlier topics, so day 5 can build on day 1.
- **Values points per chain.** The card prompt takes the perspective and values points from the chain's own topic (Egypt week 3's points on its topics; a short lesson's own), not from the week.
- **The theme.** Titled from the thread's chapter and the week number ("Week 1: The river, and short lessons"), with `topic_ids` listing every row it uses and `plan_week` set. `--week N` means the family's week N of the mixed plan; `--days`, `--child` and `--rebuild` work as today, and a rebuild keeps the week's own short lessons.
- **The report** adds, per day, which slot carried the thread and which short lessons ran, beside what it already says (cards without a picture, slots with no approved item, cost).
- **plan:import** reads the library file beside the stretches, validates it the same way, and writes `kind` and `position`. `content:fetch` needs no change: it reads `sources` from every imported row.

## The 28 lessons

Each lesson has its key, subject, slot and the day it lands on in week 1; a one-line summary per grade band (the full summaries are written in stage 2, in the Egypt plan's style, for the tutor rather than the child, with the mechanism named); the values points it touches, if any; and 1-3 picture or recording candidates.

Candidates were found on 16 Oct 2026 the way step 2b found Egypt's: the Met (Collection API search), the Art Institute of Chicago (API search, public domain only) and Wikimedia Commons (file search, then each file's own license through `extmetadata`, which `core/content/commons.ts` reads). The search code was a throwaway and isn't in the repo. The rules: CC0 or public domain only, from the file's own page for Commons; no nudity; nothing frightening for a 7-year-old; a real object, place, artwork or photograph that shows the mechanism before any modern illustration; a recording from Commons for listen lessons (Musopen is checked by hand, so it isn't used). Each item still goes through `content:fetch`, where the flag model looks at it, and anything it flags waits at `/parent/content`. **Suggested** marks the one or two I'd take. Ids are written the way the library's `sources` would name them.

The Met's old search address (`/public/collection/v1/search`) was retired on 1 Oct 2026; the searches used `v1.1`. The object address the adapter uses still works, so `content:fetch` is unaffected.

**Where it's thin.** four-notes has no open recording of the first movement, so as a listen lesson it has nothing to hear (options are in its entry). whale-song has calls, not a full song. carnival-of-the-animals has only the Swan. tangram has no museum object, only a modern photo and a 1917 diagram. Three puzzle pictures come from the same 1283 Book of Games, so you may want one of them, not all three.

Three lessons are marked as touching values points: doubling-grains (24, money), how-fossils-form (5, the age of the Earth) and aloha-oe (17, colonization, because the older summary names the 1893 overthrow). The gate reads the marks in step 5.

---

## look

### great-wave: The Great Wave, and how a woodblock print is made (art; week 1, day 1)

- **2-3:** Hokusai's Great Wave is a print, not a painting: it was carved into wooden blocks, one block for each color, and pressed onto paper again and again, so thousands of people could own a copy.
- **4-5:** The printer inked one carved block per color and lined the paper up with notches cut into each block, so the colors land in the right place; the Prussian blue was a new, cheap imported pigment, and Mount Fuji sits tiny in the trough of the wave to make the wave look huge.
- **Values points:** none.

1. **Suggested.** `aic-great-wave`: AIC 24645, *Under the Wave off Kanagawa (The Great Wave)*, Hokusai, 1830/33, color woodblock print. https://www.artic.edu/artworks/24645. CC0. Shows the wave towering over three boats, with Mount Fuji small behind. Why: one of the many copies printed from the same carved blocks. (The Met's impressions 45434, 36491, 39799 and 56353 also qualify.)
2. **Suggested.** `met-sadahide-line-block-proof`: Met 73642, *Proof Line-Block Print for Fan*, Utagawa Sadahide, 19th century. https://www.metmuseum.org/art/collection/search/73642. CC0. Shows a harbor scene with boats and people in black outline only, no color. Why: what the first, outline block prints before any color block is added, so it shows "one block per color" directly.
3. `met-korean-printing-woodblock`: Met 73360, *Woodblock of Collected Poems of the House of Springtime Sleep*, Korea, 19th century. https://www.metmuseum.org/art/collection/search/73360. CC0. Shows a real carved wooden printing block with handles, covered in raised characters. Why: what a block looks like, carved in reverse. It's Korean and prints text, not a Japanese color block.

No open photo of Japanese printing tools was found (the Commons photo of a baren is CC BY-SA).

### harvesters: The Harvesters, and why far things look small and pale (art; week 1, day 2)

- **2-3:** In Bruegel's painting of a wheat harvest, people far away are painted tiny and the hills are pale and bluish, which is how the painter makes a flat picture look deep; it's full of small stories to find, like the man asleep under the tree.
- **4-5:** Bruegel uses two kinds of perspective: things shrink with distance (linear), and air makes far things paler and bluer (aerial); painted in 1565 as one of six pictures of the seasons, it shows real farm work, from cutting with scythes to carrying sheaves to eating lunch in the field.
- **Values points:** none.

1. **Suggested.** `met-bruegel-harvesters`: Met 435809, *The Harvesters*, Pieter Bruegel the Elder, 1565. https://www.metmuseum.org/art/collection/search/435809. CC0. Shows workers cutting and stacking wheat, others eating lunch under a tree, and a valley stretching to a pale bay far off. Why: far things smaller and paler, and small scenes everywhere to find. The Met record has ten extra detail images, which help on an iPad.

One item is enough here; a second look on the same day isn't needed for a one-day lesson.

### audubon-birds: Audubon painted every bird life-size (art; week 1, day 4)

- **2-3:** John James Audubon wanted to paint every bird in America the size it really is, so the big birds had to bend to fit the huge pages: his flamingo has its neck curved down to the ground.
- **4-5:** Audubon studied birds where they lived and painted them life-size on the largest paper made, doing things birds do (hunting, feeding, fighting over food); his Birds of America (1827-1838) had 435 plates, printed from engraved copper and colored by hand.
- **Values points:** none. (Audubon shot birds to pose them, which was usual then; the cards can say so plainly or leave it out.)

1. **Suggested.** `commons-audubon-flamingo-nga`: Commons, *Robert Havell after John James Audubon, American Flamingo, 1838, NGA 32572.jpg*. https://commons.wikimedia.org/wiki/File:Robert_Havell_after_John_James_Audubon,_American_Flamingo,_1838,_NGA_32572.jpg. CC0 (National Gallery of Art). Shows the life-size flamingo with its neck bent down to fit the page. Why: the "bent to fit" plate itself.
2. `commons-audubon-flamingo-plate-431`: Commons, *431 American Flamingo.jpg*. https://commons.wikimedia.org/wiki/File:431_American_Flamingo.jpg. Public domain (1827-38). The same plate as a very large scan; an alternative to 1, not a second picture.
3. `met-audubon-song-sparrow`: Met 918292, *Song Sparrow*, Birds of America plate. https://www.metmuseum.org/art/collection/search/918292. CC0 per the Met's search listing; not yet fetched on its own, so check before choosing. A small bird life-size, beside the giant flamingo.

The Met and AIC hold other Birds of America plates, but no flamingo.

### dots-that-mix: Seurat's dots mix in your eye (art; week 1, day 5)

- **2-3:** Up close, Seurat's painting of people in a park is made of thousands of tiny dots of color; step back, and your eye mixes them, so blue and yellow dots side by side look green.
- **4-5:** Seurat (A Sunday on La Grande Jatte, 1884-86) put pure colors next to each other instead of mixing them on the palette, following the science of color of his day, so the colors blend in the eye and stay bright; it took him two years, and the painting is about 10 feet wide.
- **Values points:** none.

1. **Suggested.** `aic-grande-jatte`: AIC 27992, *A Sunday on La Grande Jatte — 1884*, Seurat, 1884-86. https://www.artic.edu/artworks/27992. CC0. Shows people strolling and resting in a park by the river, with a dog, a monkey on a leash and boats. Why: the painting itself; the stored copy is 843 pixels wide, which shows the scene, not the dots.
2. **Suggested.** `commons-seurat-parade-detail`: Commons, *Georges Seurat, Parade de cirque, detail of central figure.jpg*. https://commons.wikimedia.org/wiki/File:Georges_Seurat,_Parade_de_cirque,_detail_of_central_figure.jpg. Public domain (Seurat died 1891). Shows a trombone player in a pointed hat, every area plainly made of separate dots. Why: the dots show at iPad size. A little dim and shadowy, not frightening. It's from another of Seurat's paintings.
3. `met-grande-jatte-study`: Met 437658, *Study for "A Sunday on La Grande Jatte"*, Seurat, 1884. https://www.metmuseum.org/art/collection/search/437658. CC0. Shows the same park with no people. Why: compare the empty park with the crowded finished picture; looser brushwork, not dots.

No usable open close-up of La Grande Jatte itself was found: the Commons ones are tiny, CC BY, or enormous tiles.

### arcimboldo-faces: Faces made of fruit and books (art; week 1, day 6)

- **2-3:** About 450 years ago, Giuseppe Arcimboldo painted faces made entirely of fruit, vegetables, flowers or books; our brains are so quick to find faces that we see the person first and the pears second.
- **4-5:** Arcimboldo, a painter at the Habsburg court, built portraits from things that belong together (the seasons from what grows in each, a librarian from books), as a clever joke for the emperor; seeing faces in things that aren't faces has a name, pareidolia, and it's why a car's front can look happy or cross.
- **Values points:** none.

1. **Suggested.** `commons-arcimboldo-summer`: Commons, *Giuseppe Arcimboldo - Summer - Google Art Project.jpg*. https://commons.wikimedia.org/wiki/File:Giuseppe_Arcimboldo_-_Summer_-_Google_Art_Project.jpg. Public domain (1563). A face in profile made of fruit and vegetables: a pear for a nose, a pea pod for a mouth, a coat of woven wheat. No nudity.
2. **Suggested.** `commons-arcimboldo-vertumnus`: Commons, *Giuseppe Arcimboldo - Rudolf II of Habsburg as Vertumnus - Google Art Project.jpg*. https://commons.wikimedia.org/wiki/File:Giuseppe_Arcimboldo_-_Rudolf_II_of_Habsburg_as_Vertumnus_-_Google_Art_Project.jpg. Public domain (1591). The emperor as a head and shoulders of fruit, flowers and vegetables. No nudity. Why: a real person's portrait, which makes the joke.
3. `commons-arcimboldo-librarian`: Commons, *Guiseppe Arcimboldo, copy?, after? - The Librarian - Google Art Project.jpg*. https://commons.wikimedia.org/wiki/File:Guiseppe_Arcimboldo,_copy%3F,_after%3F_-_The_Librarian_-_Google_Art_Project.jpg. Public domain (about 1562). A figure made of books. The file marks it as possibly a copy, so the credit would say "after Arcimboldo".

### van-gogh-bedroom: Van Gogh painted his bedroom three times (art; week 1, day 7)

- **2-3:** Van Gogh painted his little bedroom in bright colors because he wanted it to feel restful, and he liked it so much he painted it three times; look for the things that come in pairs.
- **4-5:** Van Gogh used colors that sit opposite each other on the color wheel (blue walls against orange-brown furniture, red against green) because opposites make each other look brighter; he flattened the shadows on purpose, like the Japanese prints he collected, and painted the room three times in 1888-89.
- **Values points:** none.

1. **Suggested.** `aic-van-gogh-bedroom`: AIC 28560, *The Bedroom*, Van Gogh, 1889. https://www.artic.edu/artworks/28560. CC0. Shows a small room with a red blanket on a yellow bed, blue walls, two chairs and pictures on the wall. Why: blue against orange, red against green.
2. **Suggested.** `commons-van-gogh-bedroom-amsterdam`: Commons, *Vincent van Gogh - De slaapkamer - Google Art Project.jpg*. https://commons.wikimedia.org/wiki/File:Vincent_van_Gogh_-_De_slaapkamer_-_Google_Art_Project.jpg. Public domain (Van Gogh died 1890). The first version, 1888 (Van Gogh Museum). Why: beside the Chicago one, a child can spot what changed.
3. `commons-van-gogh-bedroom-letter-sketch`: Commons, *Vincent van Gogh - Vincent's Bedroom in Arles - Letter Sketch October 1888.jpg*. https://commons.wikimedia.org/wiki/File:Vincent_van_Gogh_-_Vincent%27s_Bedroom_in_Arles_-_Letter_Sketch_October_1888.jpg. Public domain. His ink sketch of the room in a letter to his brother Theo. Why: he planned the room and its colors before painting it.

## wonder

### leap-years: Why we have leap years (science; week 1, day 1)

- **2-3:** Earth takes 365 days and about six hours to go round the Sun, so every four years those extra quarter days add up to a whole day, and February gets a 29th.
- **4-5:** A year is about 365.2422 days, a little less than 365¼, so adding a day every four years overshoots; since 1582 the calendar skips the leap day in century years unless they divide by 400 (1900 wasn't a leap year, 2000 was), which keeps the seasons in place.
- **Values points:** none. (The 1582 calendar was a pope's reform, to keep Easter in spring; a plain fact, not point 1.)

1. **Suggested.** `commons-wright-orrery`: Commons, *Wright of Derby, The Orrery.jpg* (*A Philosopher Lecturing on the Orrery*, Joseph Wright of Derby, about 1766). https://commons.wikimedia.org/wiki/File:Wright_of_Derby,_The_Orrery.jpg. Public domain. Children and adults round a model of the planets, a lamp standing in for the Sun. Why: Earth going once round the Sun is what a year is.
2. **Suggested.** `met-calendrier-1784-bissextile`: Met 681357, *Le calendrier de la cour ... pour l'année bissextile 1784*. https://www.metmuseum.org/art/collection/search/681357. CC0. A printed court calendar for 1784, with sunrise and sunset times. Why: "bissextile" is French for leap year, so it's a real calendar with the extra day.
3. `met-orrery-clock-thouverez`: Met 785846, *Orrery clock*, Louis Thouverez, 1790. https://www.metmuseum.org/art/collection/search/785846. CC0. A clock topped by a working model of the planets. Why: counting time tied to Earth's trip round the Sun.

The 1582 reform items on Commons are too small for an iPad.

### new-land-from-lava: Hawaii is still being made (science; week 1, day 3)

- **2-3:** Kīlauea on the Big Island is one of the most active volcanoes in the world; when its lava flows into the ocean it cools into black rock, and the island gets a little bigger.
- **4-5:** The Hawaiian islands sit over a hot spot in Earth's mantle while the Pacific plate moves slowly northwest, so each island is carried away from the hot spot and a new one forms behind it: Kauaʻi is the oldest of the big islands and the Big Island the youngest; lava that reaches the sea can add new land, and smooth, ropy pāhoehoe and rough ʻaʻā are Hawaiian words geologists use everywhere.
- **Values points:** none. (Pele, in Hawaiian tradition, is the volcano goddess; if the cards mention her, it's point 4, and the lesson would need marking.)

1. **Suggested.** `commons-nps-lava-enters-ocean-torrent`: Commons, *Lava enters ocean in torrent-Hawaii Volcanoes National Park (33706635605).jpg*. https://commons.wikimedia.org/wiki/File:Lava_enters_ocean_in_torrent-Hawaii_Volcanoes_National_Park_(33706635605).jpg. Public domain (National Park Service, January 2017). Orange lava pouring off a black-rock cliff into the sea, with steam. Why: the moment new land forms.
2. **Suggested.** `commons-iss38-hawaiian-chain`: Commons, *ISS-38 Hawaiian Island chain.jpg*. https://commons.wikimedia.org/wiki/File:ISS-38_Hawaiian_Island_chain.jpg. Public domain (NASA, 2014). The islands from the space station. Why: every island in it was built by volcanoes, oldest to youngest in a line.
3. `commons-nanawale-lava-1840`: Commons, *View of a stream of lava as it entered the sea at Nanawale, 1840.jpg* (Kaleohano and Nuuanu, about 1840). https://commons.wikimedia.org/wiki/File:View_of_a_stream_of_lava_as_it_entered_the_sea_at_Nanawale,_1840.jpg. Public domain. Hawaiian artists' drawing of lava reaching the sea in Puna. Why: the same thing seen 180 years ago, by Hawaiians.

### moon-phases: Why the Moon changes shape (science; week 1, day 4)

- **2-3:** The Moon doesn't make its own light; the Sun always lights half of it, and as the Moon goes round Earth each month we see more or less of that lit half.
- **4-5:** The cycle from new moon through full and back takes about 29½ days, the root of the word "month"; the Earth's shadow has nothing to do with phases (that's an eclipse), and the same side of the Moon always faces us because it turns once for each trip around Earth.
- **Values points:** none.

1. **Suggested.** `met-mellan-moon-first-quarter`: Met 393278, *The Moon in its First Quarter*, Claude Mellan, 1635. https://www.metmuseum.org/art/collection/search/393278. CC0. An engraving, made through a telescope, of a half-lit Moon. Why: one half lit, one half dark is the whole idea. The same series has *Full Moon* (Met 393543) and *The Moon in its Final Quarter* (Met 359769), both CC0.
2. **Suggested.** `commons-al-biruni-lunar-phases`: Commons, *Lunar phases al-Biruni.jpg* (from an 18th-century copy of al-Biruni's *Kitab al-Tafhim*). https://commons.wikimedia.org/wiki/File:Lunar_phases_al-Biruni.jpg. Public domain. A hand-drawn diagram of the phases around the Moon's circuit. Why: where the Moon is decides how much of the lit half we see, explained about a thousand years ago.
3. `commons-galileo-moon-phases`: Commons, *Galileo moon phases.jpg* (1616). https://commons.wikimedia.org/wiki/File:Galileo_moon_phases.jpg. Public domain. Galileo's own sketches of several phases; small (585 by 818).

### blue-sky-red-sunset: Why the sky is blue and sunsets are red (science; week 1, day 5)

- **2-3:** Sunlight looks white but is made of all the colors; the air bounces blue light around the sky more than the other colors, so the sky looks blue, and at sunset the light comes through so much air that most of the blue is bounced away, leaving orange and red.
- **4-5:** Air molecules scatter short wavelengths (blue, violet) far more than long ones (red), which is called Rayleigh scattering; we see blue rather than violet because the Sun gives less violet and our eyes are less sensitive to it; a prism splits white light into its colors, the way Newton showed in the 1660s.
- **Values points:** none.

1. **Suggested.** `commons-dispersive-prism`: Commons, *Dispersive prism.png*. https://commons.wikimedia.org/wiki/File:Dispersive_prism.png. CC0 (2013). A photo of sunlight through a glass prism spreading into colors. Why: sunlight is made of all the colors.
2. **Suggested.** `commons-sunset-from-iss`: Commons, *Sunset from the ISS.JPG*. https://commons.wikimedia.org/wiki/File:Sunset_from_the_ISS.JPG. Public domain (NASA, 2010). A sunset over the Indian Ocean from orbit, with the bands of the atmosphere along Earth's edge. Why: that thin layer of air does the scattering. (The blue band shows best in *ISS007-E-11202 - View of atmospheric limb.jpg*, also NASA, public domain.)
3. `met-kuindzhi-red-sunset`: Met 436833, *Red Sunset*, Arkhyp Kuindzhi, 1905-8. https://www.metmuseum.org/art/collection/search/436833. CC0. A deep red sunset over a river plain. Why: the reds left when light crosses a lot of air.

### tiny-animals-in-water: The first person to see germs (science; week 1, day 6)

- **2-3:** About 350 years ago, a cloth seller named Antonie van Leeuwenhoek made tiny magnifying glasses and saw "little animals" swimming in a drop of pond water, living things too small to see; some kinds can make us sick, which is why we wash our hands with soap.
- **4-5:** Leeuwenhoek's microscopes were a single tiny glass bead in a metal plate, magnifying about 270 times, better than anyone else's then; he drew bacteria from his own teeth in 1683, and two hundred years later scientists showed that some microbes cause disease; soap works by pulling apart the oily layer around many germs and washing them off.
- **Values points:** none.

1. **Suggested.** `commons-leeuwenhoek-duckweed-animalcules`: Commons, *Plate XXVIII - Illustrations to Leeuwenhoeks Letter on the animalcules found on Duckweed.jpg* (1702). https://commons.wikimedia.org/wiki/File:Plate_XXVIII_-_Illustrations_to_Leeuwenhoeks_Letter_on_the_animalcules_found_on_Duckweed.jpg. Public domain. The tiny creatures he saw in pond water, drawn for his letter. Why: some of the first pictures of microbes.
2. **Suggested.** `commons-leeuwenhoek-microscope-baker-1753`: Commons, *Leeuwenhoek microscope drawn by Baker, 1753.jpg*. https://commons.wikimedia.org/wiki/File:Leeuwenhoek_microscope_drawn_by_Baker,_1753.jpg. Public domain. One of his small hand-held brass microscopes. Why: how simple the tool was.
3. `met-gandolfi-leeuwenhoek`: Met 338827, *The Dutch Microscopist Anton van Leeuwenhoek*, Gaetano Gandolfi, pen and wash. https://www.metmuseum.org/art/collection/search/338827. CC0. A drawn portrait of him.

No open photo of a replica microscope (the ones on Commons and Wellcome are CC BY or CC BY-SA).

### how-fossils-form: How a living thing turns to stone (science; week 1, day 7)

- **2-3:** When a sea animal like an ammonite died and was buried quickly in mud, the mud slowly hardened into rock, and minerals filled in its shape, so the shape lasted long after the animal was gone.
- **4-5:** Most fossils form when a body is buried fast in sediment, the soft parts rot, and water carrying minerals fills the spaces or the shell dissolves and leaves a mold; the layers of rock build up over a very long time, and geologists date them as many millions of years old; in 1811-12, Mary Anning, aged 12, and her brother dug an ichthyosaur, a sea reptile, out of the cliffs of an English beach, one of the first that scientists studied.
- **Values points:** 5 (the age of the Earth and universe), because the older summary gives the age geologists measure. Proposed perspective: several_fairly.

1. **Suggested.** `commons-ammonite-pavement`: Commons, *Ammonite Pavement.jpg*. https://commons.wikimedia.org/wiki/File:Ammonite_Pavement.jpg. CC0 (2025). Many coiled ammonite shells turned to stone in a flat rock shelf on the shore. Why: shells set in hardened layers of mud. The description says Monmouth, probably Monmouth Beach at Lyme Regis, Mary Anning's home; not confirmed.
2. **Suggested.** `commons-fossil-trilobite-todd`: Commons, *Fossil Trilobite.jpg* (Henan Geological Museum). https://commons.wikimedia.org/wiki/File:Fossil_Trilobite.jpg. CC0 (2015). A whole trilobite in stone. Why: the clear shape of a living thing, now rock.
3. `commons-anning-ichthyosaur-1814`: Commons, *Anning 1st ichthyosaur skeleton.jpg* (Everard Home, 1814). https://commons.wikimedia.org/wiki/File:Anning_1st_ichthyosaur_skeleton.jpg. Public domain. An engraving of the Annings' ichthyosaur; small (685 by 434).

The Met and AIC hold no fossils with images.

## listen

### carnival-of-the-animals: Instruments that sound like animals (music; week 1, day 1)

- **2-3:** In The Carnival of the Animals, Saint-Saëns made each instrument play an animal: a slow, smooth cello is a swan gliding on water, and a heavy double bass is a dancing elephant.
- **4-5:** Saint-Saëns wrote it in 1886 as a joke for friends and wouldn't let it be published while he lived (except The Swan); composers pick an instrument for an animal by its range, speed and texture: low and heavy, high and quick, smooth or bouncy.
- **Values points:** none.

1. **Suggested.** `commons-bokor-le-cygne-1925`: Commons, *Judith Bokor plays Le Cygne by Saint-Saëns.flac*. https://commons.wikimedia.org/wiki/File:Judith_Bokor_plays_Le_Cygne_by_Saint-Saëns.flac. Public domain (a Columbia 78 recorded 5 June 1925; 1925 recordings entered the US public domain on 1 Jan 2026). The Swan, cello and piano, 2:34. Why: the cello's long smooth line is the gliding swan.
2. `commons-weilerstein-swan-2009`: Commons, *20091104 Alisa Weilerstein and Jason Yoder - Saint Saëns' The Swan.ogg*. https://commons.wikimedia.org/wiki/File:20091104_Alisa_Weilerstein_and_Jason_Yoder_-_Saint_Saëns'_The_Swan.ogg. Public domain (recorded by the White House at a 2009 concert), but the page also carries a stray CC BY 3.0 tag, so the adapter may read the wrong one. Clean modern sound, 2:56.
3. **Suggested (picture).** `met-505461-vuillaume-cello`: Met 505461, *Violoncello*, Jean Baptiste Vuillaume, mid-19th century. https://www.metmuseum.org/art/collection/search/505461. CC0. A whole cello standing upright. Why: the instrument that plays the swan.

No open recording of the Aquarium, the Elephant or Fossils: every movement on Commons is CC BY-SA. So the lesson leans on the Swan; the other animals would be told, not heard.

### stars-and-stripes: A march has a beat for your feet (music; week 1, day 2)

- **2-3:** John Philip Sousa's The Stars and Stripes Forever is a march: its steady beat goes left-right, left-right, so a band can play while walking; near the end, listen for the piccolo, the smallest, highest flute, whistling above everyone.
- **4-5:** A march is in two (or four) beats to the bar at walking speed, about 120 steps a minute; Sousa led the United States Marine Band and wrote it in 1896, and it's the national march of the United States by law since 1987; the famous piccolo part is a countermelody, a second tune played over the main one.
- **Values points:** none.

1. **Suggested.** `commons-usmb-stars-stripes-2017`: Commons, *Sousa's "The Stars and Stripes Forever" - United States Marine Band (2017).mp3*. https://commons.wikimedia.org/wiki/File:Sousa's_%22The_Stars_and_Stripes_Forever%22_-_United_States_Marine_Band_(2017).mp3. Public domain (US Marine Corps work). 3:34, with the piccolo part in the last strain. Why: a steady left-right beat, played by Sousa's own old band.
2. `commons-sousas-band-1909`: Commons, *Sousa's Band - Stars and Stripes Forever.ogg*. https://commons.wikimedia.org/wiki/File:Sousa's_Band_-_Stars_and_Stripes_Forever.ogg. Public domain (Edison cylinder, November 1909, National Park Service Edison collection). Crackly. Why: Sousa's own touring band, in his lifetime.
3. **Suggested (picture).** `commons-sousa-1895-loc`: Commons, *John Philip Sousa, three-quarter length portrait, standing, facing front LCCN2005676156.jpg*. https://commons.wikimedia.org/wiki/File:John_Philip_Sousa,_three-quarter_length_portrait,_standing,_facing_front_LCCN2005676156.jpg. Public domain (1895, Library of Congress). Sousa in band uniform. (A piccolo instead: Met 504054, Louis Lot, CC0, not yet looked at.)

### whale-song: Humpback whales sing (science; week 1, day 3)

- **2-3:** Male humpback whales sing long songs of moans, whoops and squeaks, and the whales near Hawaii in winter all sing the same song, which slowly changes through the season.
- **4-5:** Sound travels about four times faster in water than in air and much farther, so whales can hear each other across miles of ocean; scientists recorded the songs with underwater microphones, and the songs have themes that repeat, like verses; humpbacks come to Hawaii from Alaska every winter to have their calves.
- **Values points:** none.

1. **Suggested.** `commons-nps-humpback-moo-2001`: Commons, *Humpback whale moo.ogg*. https://commons.wikimedia.org/wiki/File:Humpback_whale_moo.ogg. Public domain (National Park Service hydrophone, Glacier Bay, Alaska, 2001). 30 seconds of moans and calls at real speed. Why: the real underwater sound, heard by a microphone far from the whale. Alaska is where Hawaii's humpbacks spend the summer.
2. `commons-noaa-akhump-1999`: Commons, *Akhumphi1x.ogg*. https://commons.wikimedia.org/wiki/File:Akhumphi1x.ogg. Public domain (NOAA, 1999). 47 seconds, but sped up ten times, which the card would have to say.
3. **Suggested (picture).** `commons-noaa-humpback-breach-2015`: Commons, *HIHWNMS - Humpback Breaching (33591142200).jpg*. https://commons.wikimedia.org/wiki/File:HIHWNMS_-_Humpback_Breaching_(33591142200).jpg. Public domain (NOAA, Hawaiian Islands Humpback Whale National Marine Sanctuary). A whole humpback leaping clear of the water off Maui. Why: the singer, in Hawaiian waters.

Neither recording is a full song: the song recordings on Commons are CC BY or of unknown origin. The lesson can be about calls rather than songs, or wait for a better recording.

### four-notes: A whole movement from four notes (music; week 1, day 5)

- **2-3:** Beethoven's Fifth Symphony starts with four notes, short-short-short-long, and he keeps bringing them back, higher, lower, louder, softer, so the whole first part is built from that one little pattern.
- **4-5:** The four-note motif returns in almost every bar of the first movement (1808), passed between instruments and changed in pitch and loudness, which is how a short idea becomes a long piece; Beethoven was losing his hearing while he wrote it.
- **Values points:** none.

1. **Suggested (picture).** `commons-beethoven5-autograph`: Commons, *BeethovenSinfonia5autografo.jpg*. https://commons.wikimedia.org/wiki/File:BeethovenSinfonia5autografo.jpg. Public domain. Beethoven's handwritten first page; the three quick notes and the long one show in several staves. Why: the four notes in his own hand. A bit small (1064 by 850).
2. `commons-stieler-beethoven-1820`: Commons, *Joseph Karl Stieler's Beethoven mit dem Manuskript der Missa solemnis.jpg*. https://commons.wikimedia.org/wiki/File:Joseph_Karl_Stieler's_Beethoven_mit_dem_Manuskript_der_Missa_solemnis.jpg. Public domain. The famous 1820 portrait.

**No recording.** No open recording of the first movement was found: the best-known one on Commons (Fulda Symphonic Orchestra) shows "public domain" in the API but its page says Open Audio License, an attribution licence; others are from Musopen, CC BY, or European recordings (1937, 1945) whose US status is unclear. The only US public-domain orchestral recording is the fourth movement (Victor Concert Orchestra, 1917). A listen card with nothing to hear isn't much of a listen card: cut this lesson, move it to the look slot with the manuscript, or keep it and let the Musopen recording wait at /parent/content for you to check by hand. Your call.

### round-and-canon: A tune that fits on top of itself (music; week 1, day 6)

- **2-3:** In a round like Row, Row, Row Your Boat, everyone sings the same tune, but each group starts later, and it still fits together; Pachelbel's Canon works the same way, with three violins playing one tune a little apart.
- **4-5:** A canon fits because the tune is built on a repeating bass line (in Pachelbel's, eight notes played 28 times), so every part of the tune sits on the same chords whenever it comes in; Pachelbel wrote it about 1700, and it was nearly forgotten until the 1960s.
- **Values points:** none.

1. **Suggested.** `commons-usaf-strolling-strings-canon-2004`: Commons, *Canon (2004) - Strolling Strings - United States Air Force Band.mp3*. https://commons.wikimedia.org/wiki/File:Canon_(2004)_-_Strolling_Strings_-_United_States_Air_Force_Band.mp3. Public domain (US Air Force work; Pachelbel died 1706). Strings, 3:49. Why: the same tune enters again and again over a repeating bass. The arrangement is credited to Frank Hudson; the page credits the performance and recording to the Air Force, which I take as covering it, but it's worth knowing.
2. **Suggested (picture).** `commons-pachelbel-canon-ms-16481`: Commons, *Pachelbel's Canon - Mus.MS 16481-8 Page 1.jpg*. https://commons.wikimedia.org/wiki/File:Pachelbel's_Canon_-_Mus.MS_16481-8_Page_1.jpg. Public domain (Staatsbibliothek zu Berlin). The first page of the oldest surviving copy. Why: three violin lines and a bass; a child can see the same tune written again lower down.

No open recording of a sung round: Row, Row, Row Your Boat is CC BY-SA, and Frère Jacques is only a MIDI file.

### aloha-oe: A queen's song: Aloha ʻOe (music; week 1, day 7)

- **2-3:** Aloha ʻOe, "farewell to you", was written by Liliʻuokalani, who later became Hawaii's queen; it's a goodbye song, and its chorus is sung slowly, so many people sing it together at partings.
- **4-5:** Liliʻuokalani wrote Aloha ʻOe in 1878, about a farewell she saw on a ride home; she wrote over 160 songs, became queen in 1891, and was the last monarch of the Hawaiian Kingdom, which was overthrown in 1893 with the help of United States Marines; the song is now one of the best-known pieces of Hawaiian music.
- **Values points:** 17 (explorers and colonization), because the older summary names the overthrow. Proposed perspective: several_fairly. If the overthrow is left out, the lesson touches no point; that's a choice for the two of you.

1. **Suggested.** `commons-alapai-aloha-oe-1911`: Commons, *Madam Alapai, Henry N. Clark - Aloha Oe.ogg*. https://commons.wikimedia.org/wiki/File:Madam_Alapai,_Henry_N._Clark_-_Aloha_Oe.ogg. Public domain (Columbia Records, 1911). Sung by a Hawaiian singer, 2:56. Why: the queen's song as it sounded in her lifetime.
2. `commons-smith-kolomoku-aloha-oe-1915`: Commons, *William Smith, Walter K. Kolomoku - Aloha Oe.ogg*. https://commons.wikimedia.org/wiki/File:William_Smith,_Walter_K._Kolomoku_-_Aloha_Oe.ogg. Public domain (1915). A Hawaiian steel guitar duet, no singing, 3:33. Why: the same tune on a Hawaiian instrument.
3. **Suggested (picture).** `commons-liliuokalani-c1891`: Commons, *Liliuokalani, c. 1891.jpg*. https://commons.wikimedia.org/wiki/File:Liliuokalani,_c._1891.jpg. Public domain (James J. Williams; Library of Congress). A signed portrait of the queen. Why: the person who wrote it.

## then

### boy-who-cried-wolf: A lie and a mistake (literature; week 1, day 2)

- **2-3:** In Aesop's fable, a shepherd boy shouts "Wolf!" for fun until nobody believes him, so when a real wolf comes, nobody helps; a lie is saying something you know isn't true, and a mistake is saying something wrong that you believed.
- **4-5:** What makes a lie is what the speaker knows and means, not whether the words turn out true; a mistake is fixed by finding out, a lie costs trust, and trust is slow to come back, which is the fable's point; Aesop's fables were told in Greece about 2,500 years ago.
- **Values points:** none.

1. **Suggested.** `commons-budd-shepherd-boy-telephone`: Commons, *St. Nicholas-Vol 1.1-395.jpg*, "Old Fables Brought Up to Date: The Shepherd Boy and the Wolf", Charles Jay Budd. https://commons.wikimedia.org/wiki/File:St._Nicholas-Vol_1.1-395.jpg. Public domain (published before 1930; Budd died 1926). A shepherd boy shouting "WOLF, WOLF" into a telephone on a pole, sheep grazing calmly, a tiny wolf far off on the hill. Why: the false alarm itself, and funny; nothing frightening.
2. `commons-milo-winter-boy-cried-wolf-1919`: Commons, *The Boy Who Cried Wolf - Project Gutenberg etext 19994.jpg* (Milo Winter, *The Aesop for Children*, 1919). https://commons.wikimedia.org/wiki/File:The_Boy_Who_Cried_Wolf_-_Project_Gutenberg_etext_19994.jpg. Public domain. The boy running with his staff raised while a wolf grabs a lamb by the neck. No blood, but mid-attack, and small (350 by 588): your call.
3. `commons-barlow-boy-cried-wolf-1687`: Commons, *Boycriedwolfbarlow.jpg* (Francis Barlow, 1687). https://commons.wikimedia.org/wiki/File:Boycriedwolfbarlow.jpg. Public domain. A wolf running off with a sheep in its jaws. Listed for completeness; too much for a 7-year-old, I think.

### first-flight: Twelve seconds at Kitty Hawk (history; week 1, day 3)

- **2-3:** On 17 December 1903, Orville Wright flew a motor-powered airplane for 12 seconds on a windy beach at Kitty Hawk, North Carolina, while his brother Wilbur ran alongside; it was the first flight like it, and they flew three more times that day.
- **4-5:** The Wrights solved control before power: they learned from kites and gliders, built a wind tunnel to test wing shapes, and steered by twisting the wing tips (wing-warping); the first flight went 120 feet, shorter than a jumbo jet's wingspan, and the photo was taken by a lifesaving station worker the brothers had set up with their camera.
- **Values points:** none.

1. **Suggested.** `commons-wright-first-flight`: Commons, *Wright First Flight 1903Dec17 (full restore 115).jpg*. https://commons.wikimedia.org/wiki/File:Wright_First_Flight_1903Dec17_(full_restore_115).jpg. Public domain (John T. Daniels, 17 Dec 1903, Library of Congress). Shows Orville flying just above the sand while Wilbur runs alongside. Why: the moment itself. A restored copy; the unrestored one is *First flight2.jpg*, also public domain.
2. **Suggested.** `commons-wright-1902-glider`: Commons, *1902-10-10 KittyHawk WilburWrightGliding.jpg*. https://commons.wikimedia.org/wiki/File:1902-10-10_KittyHawk_WilburWrightGliding.jpg. Public domain (Orville Wright, 1902). Shows Wilbur on the 1902 glider. Why: they learned to steer with gliders before adding an engine.
3. `commons-wright-glider-launch-1902`: Commons, *1902 Wright Brothers' Glider Tests - GPN-2002-000125.jpg*. https://commons.wikimedia.org/wiki/File:1902_Wright_Brothers%27_Glider_Tests_-_GPN-2002-000125.jpg. Public domain (NASA, a 1902 photo). Shows the third glider being launched at Kill Devil Hills.

No open picture of their wind tunnel was found (the replica photo is CC BY-SA).

### why-greenland-looks-huge: Why Greenland looks as big as Africa (geography; week 1, day 4)

- **2-3:** You can't flatten an orange peel without stretching or tearing it, and maps of the round Earth have the same problem; on the most common world map, places near the poles get stretched, so Greenland looks as big as Africa, but Africa is about 14 times bigger.
- **4-5:** Mercator's map (1569) keeps directions true so sailors can steer a straight compass line, but to do that it stretches everything more the farther it is from the equator; every flat map gives up something (size, shape, distance or direction), and only a globe keeps them all.
- **Values points:** none.

1. **Suggested.** `commons-mercator-1569-composite`: Commons, *Mercator 1569 world map composite.jpg*. https://commons.wikimedia.org/wiki/File:Mercator_1569_world_map_composite.jpg. Public domain. Mercator's own world map, all 18 sheets joined, the far north stretched huge. Why: the map that makes the puzzle. (*Greenland Mercator 1569.jpg* is a close-up of Greenland on it.)
2. **Suggested.** `commons-blue-marble-as17`: Commons, *The Blue Marble, AS17-148-22727.jpg*. https://commons.wikimedia.org/wiki/File:The_Blue_Marble,_AS17-148-22727.jpg. Public domain (NASA, Apollo 17, 1972). The round Earth with Africa large and clear. Why: beside the map, Africa's real size.
3. `met-wilson-terrestrial-globe-1828`: Met 8487, *Terrestrial Globe*, James Wilson, 1828. https://www.metmuseum.org/art/collection/search/8487. CC0. An early American globe on a wooden stand. Why: a globe keeps sizes true, and a flat map can't.

### wayfinding-to-hawaii: Finding Hawaii without a map (history; week 1, day 6)

- **2-3:** The first people to reach Hawaii sailed across thousands of miles of ocean in double canoes, finding their way by the stars, the shape of the waves and the birds; in 1976, the canoe Hōkūleʻa sailed from Hawaii to Tahiti the same way, with no compass.
- **4-5:** Polynesian navigators kept a star compass in their heads (where each star rises and sets on the horizon), read the swells that bounce off islands beyond sight, and watched birds that fly out to fish and home to land at dusk; people reached Hawaii roughly a thousand years ago, and Hōkūleʻa's 1976 voyage, guided by Mau Piailug of Micronesia, showed it could be done without instruments.
- **Values points:** none.

1. **Suggested.** `commons-hokulea-yokohama-2007`: Commons, *Hokulea2.jpg*. https://commons.wikimedia.org/wiki/File:Hokulea2.jpg. Public domain (released by the photographer). Hōkūleʻa arriving in Yokohama in 2007 under its crab-claw sails, both hulls clear. Why: the canoe that sailed to Tahiti in 1976. No federal photo of it under sail is on Commons.
2. **Suggested.** `commons-loc-stick-chart-rebbelib`: Commons, *Marshall Islands stick chart, Rebbelib type. LOC 2010586182.jpg*. https://commons.wikimedia.org/wiki/File:Marshall_Islands_stick_chart,_Rebbelib_type._LOC_2010586182.jpg. Public domain (Library of Congress, 1920s). Crossed sticks with shells for islands. Why: swells and islands mapped without instruments. It's Marshallese, a neighbouring way of wayfinding, which the card should say. (The Met's stick chart isn't public domain.)
3. `commons-webber-kalaniopuu-canoes-1779`: Commons, *HawaiianCanoes1784.jpg* (John Webber, drawn 1779). https://commons.wikimedia.org/wiki/File:HawaiianCanoes1784.jpg. Public domain. A big canoe with a crab-claw sail and long canoes full of paddlers off Kona. For you to judge: dozens of men shown bare-chested in loincloths, as engraved, nothing more. It was drawn on Cook's voyage, which brings point 17 near; the lesson stays unmarked unless the cards say so.

## puzzle

### two-dice: Why 7 comes up most (math; week 1, day 1)

- **2-3:** Roll two dice and add them: you can make 2 only one way (1 and 1), but 7 six ways (1 and 6, 2 and 5, 3 and 4, and each the other way round), so 7 comes up most.
- **4-5:** Each die has 6 faces, so two dice make 36 equally likely pairs; 6 of them add to 7, so 7 comes up 1 time in 6, and 2 or 12 only 1 time in 36; people have played with dice for at least 5,000 years, and the opposite faces of a die add to 7.
- **Values points:** none. (Dice and gambling: the cards are about counting, not betting.)

1. **Suggested.** `commons-libro-juegos-dice-players`: Commons, *Dice in Libro de los juegos.jpg* (Alfonso X's Book of Games, 1283). https://commons.wikimedia.org/wiki/File:Dice_in_Libro_de_los_juegos.jpg. Public domain. Shows two calm, seated men in bright robes under blue arches, one tipping a dice cup over a board, five dice showing. Why: people throwing dice and reading the totals, 740 years ago.
2. **Suggested.** `met-die-egypt-551069`: Met 551069, *Die*, Roman Period Egypt, 30 BCE-364 CE, stone. https://www.metmuseum.org/art/collection/search/551069. CC0. Shows one cream cube with circle-and-dot pips, three faces visible. Why: dice have had six faces, 1 to 6, for thousands of years.
3. `met-roman-ivory-die-246446`: Met 246446, *Ivory die*, Roman, 1st-3rd century. https://www.metmuseum.org/art/collection/search/246446. CC0. A single ivory cube with ring-and-dot pips. (Also checked: Met 256148, eight glass knucklebones, Greek; Met 197578, a set of five dice, about 1750-75, black and white.)

No open photo of a pair of dice side by side was found.

### snowflake-six: Why a snowflake has six arms (math; week 1, day 2)

- **2-3:** Every snowflake has six arms, because the tiny bits of water in ice fit together in six-sided rings; fold a paper circle into sixths, cut, and you get one.
- **4-5:** Ice crystals grow in a hexagonal pattern, so a snowflake has six-fold symmetry: turn it a sixth of a turn and it looks the same; each arm grows in the same air at the same moment, so the arms match, while different air makes each flake different; Wilson Bentley photographed more than 5,000 of them from 1885 on.
- **Values points:** none.

1. **Suggested.** `commons-bentley-snowflakes-1902`: Commons, *SnowflakesWilsonBentley.jpg* (Wilson Bentley, 1902, NOAA Historic NWS Collection). https://commons.wikimedia.org/wiki/File:SnowflakesWilsonBentley.jpg. Public domain. Shows a grid of snow-crystal photographs, white on black. Why: every flake has six arms, and no two are alike.
2. **Suggested.** `commons-bentley-snowflake-mopa-1905`: Commons, *Snowflake - By Wilson Bentley ca. 1905 - MoPA.jpg*. https://commons.wikimedia.org/wiki/File:Snowflake_-_By_Wilson_Bentley_ca._1905_-_MoPA.jpg. Public domain (about 1905; Bentley died 1931). One crystal, large. Why: the six arms can be counted, and the symmetry checked.
3. `commons-bentley-snowflake-565`: Commons, *Bentley Snowflake 565.jpg* (Monthly Weather Review, 1902). https://commons.wikimedia.org/wiki/File:Bentley_Snowflake_565.jpg. Public domain (a 1902 federal publication). Probably a single crystal; not looked at yet.

### knights-and-knaves: Who's telling the truth? (math; week 1, day 3)

- **2-3:** On an island, knights always tell the truth and knaves always lie; if someone says "I'm a knave," that can't be true or false without a problem, so nobody on the island can ever say it.
- **4-5:** Puzzles like this (named by the logician Raymond Smullyan) are solved by trying each case and seeing which one fits all the clues: if A says "B is a knave" and B says "We're both knights," only one answer works; they practice the same reasoning as yesterday's lie and mistake: what does the speaker know?
- **Values points:** none.

1. **Suggested.** `met-chess-knight-27389`: Met 27389, *Chess Piece in the Form of a Knight*, Western European, about 1350-60, ivory. https://www.metmuseum.org/art/collection/search/27389. CC0. Shows a small, calm ivory knight on a draped horse, holding a shield. Why: a knight with no fighting, and a game piece, which suits a puzzle.
2. **Suggested.** `commons-libro-juegos-templars-chess`: Commons, *Templars chess libro-de-los-juegos alfons-X.jpg* (1283). https://commons.wikimedia.org/wiki/File:Templars_chess_libro-de-los-juegos_alfons-X.jpg. Public domain. Two knights in white robes with red crosses thinking over a chessboard. Why: two knights facing each other, working something out. Small (555 pixels wide), and the crosses mark a religious order of knights, which you may want to know.
3. `met-armor-man-horse-35739`: Met 35739, *Armor for Man and Horse*, Kunz Lochner, Nuremberg, 1548. https://www.metmuseum.org/art/collection/search/35739. CC0. Full armor on a walking horse, black and white. What a real knight looked like; no fighting.

No open picture of the puzzle itself was found; the puzzle is in the words.

### doubling-grains: One grain, then double (math; week 1, day 4)

- **2-3:** In an old story, a clever man asks a king for one grain of rice on the first square of a chessboard, two on the next, four on the next, always doubling; by the last square it's more rice than the whole world grows.
- **4-5:** Doubling 63 times gives over 9 quintillion grains on the last square; money in a savings account grows the same way, more slowly: interest is paid on the interest already earned (compound interest), so $100 at 7% a year doubles in about 10 years and doubles again in the next 10.
- **Values points:** 24 (money, work and generosity), because it's about saving and money. Proposed perspective: family_tradition, since how a family talks about saving is its own.

1. **Suggested.** `commons-libro-juegos-two-men-chess`: Commons, *Two men playing chess - Libro de los juegos.jpg* (1283). https://commons.wikimedia.org/wiki/File:Two_men_playing_chess_-_Libro_de_los_juegos.jpg. Public domain. A whole manuscript page: two men in bright robes either side of a clear 8 by 8 board, text below. Why: a child can count the 64 squares the grains double across. (The same book as the dice and knights pictures; pick one of the three if that's too much of it in one week.)
2. **Suggested.** `met-chessboard-201546`: Met 201546, *Chessboard*, 19th century. https://www.metmuseum.org/art/collection/search/201546. CC0. An empty folding board, black and white photo, crisp squares. Why: an empty board to imagine one grain, then 2, then 4.
3. `commons-short-grain-rice-cc0`: Commons, *Short-grain rice (japonica).jpg*. https://commons.wikimedia.org/wiki/File:Short-grain_rice_(japonica).jpg. CC0. A small heap of rice with single grains around it. Why: how small one grain is. (For the savings part: Met 38482, a 15th-century terracotta piggy bank from Java, CC0, dim and grey.)

Every rice-on-a-chessboard photo on Commons is CC BY or CC BY-SA.

### tangram: Seven pieces, many shapes (math; week 1, day 5)

- **2-3:** A tangram is a square cut into seven pieces (five triangles, a square and a slanted shape) that can be put back together as a cat, a boat or a running man, always using all seven.
- **4-5:** Every tangram figure has the same area, because it's the same seven pieces moved around; the two big triangles are each a quarter of the square and the small ones a sixteenth; the puzzle came from China and swept Europe and America around 1817.
- **Values points:** none.

1. **Suggested.** `commons-tangram-two-wooden-sets`: Commons, *Tangram 2.png*. https://commons.wikimedia.org/wiki/File:Tangram_2.png. CC0 (2015). Two wooden seven-piece sets side by side, arranged into different shapes. Why: the same seven pieces, different shapes, same area. A modern photo, since no museum tangram was found.
2. **Suggested.** `commons-dudeney-tangram-figures-1917`: Commons, *Amusements in mathematics - A Tangram Paradox Diagram 10.png* (H. E. Dudeney, 1917). https://commons.wikimedia.org/wiki/File:Amusements_in_mathematics_-_A_Tangram_Paradox_Diagram_10.png. Public domain. A row of black tangram silhouettes: people, a bottle, a box. Why: many figures from the same seven pieces.
3. `commons-fashionable-chinese-puzzle-1817`: Commons, *The Fashionable Chinese Puzzle 01.jpg* (Britain, 1817). https://commons.wikimedia.org/wiki/File:The_Fashionable_Chinese_Puzzle_01.jpg. Public domain. The cover of the 1817 book from the craze. Too small for an iPad (319 by 502), and its figures are an 1817 European idea of Chinese dress.

The Met and AIC have no tangram, and the Rotterdam museum's sets on Commons are CC BY-SA.

### sunflower-spirals: Counting the spirals in a sunflower (math; week 1, day 7)

- **2-3:** The seeds in a sunflower's head sit in spirals going both ways; count them and you often get 34 one way and 55 the other, numbers from a pattern where each is the two before it added up: 1, 1, 2, 3, 5, 8, 13...
- **4-5:** Each new seed grows at a fixed turn from the last (about 137.5 degrees, the golden angle), which packs seeds with no gaps, and the spirals that show up come in Fibonacci numbers; pinecones and pineapples do it too; Fibonacci wrote about the sequence in 1202, in a puzzle about rabbits.
- **Values points:** none.

1. **Suggested.** `commons-sunflower-closeup-nm`: Commons, *Close-up sunflower head, New Mexico, U.S.jpg*. https://commons.wikimedia.org/wiki/File:Close-up_sunflower_head,_New_Mexico,_U.S.jpg. CC0 (2020). A sunflower head filling the frame, florets in clear crossing spirals. Why: the spirals are easy to trace with a finger.
2. **Suggested.** `commons-seeding-sunflower-unsplash`: Commons, *Seeding sunflower (Unsplash).jpg*. https://commons.wikimedia.org/wiki/File:Seeding_sunflower_(Unsplash).jpg. CC0 (2017). A whole sunflower with a large disc of tightly packed florets. Why: the whole head shows, so the spirals can be counted both ways.
3. `commons-besler-flos-solis-maior`: Commons, *Large Sunflower (Flos Solis Maior)*, Besler, *Hortus Eystettensis* (1613 plate, 1713 edition). https://commons.wikimedia.org/wiki/File:Unidentified_artist_-_Large_Sunflower_(Flos_Solis_Maior),_plate_1_from_part_5,_B._Besler,_%22Hortus_Eystettensis%22,_1713_edit..._-_Google_Art_Project.jpg. Public domain. A hand-colored engraving of a huge sunflower; beautiful, but the spirals are faint.

The Commons photos with spirals drawn on are CC BY-SA or GFDL; the pinecone is CC BY.

---

## Also worth a thought

Not in the 28, in case some are cut: how a vote counts (majority and ties; point 14, marked if kept), why ice floats, time zones and why it's tomorrow in Japan, how a seed knows which way is up, what a fraction of a pizza really is, and how a bridge holds itself up.
