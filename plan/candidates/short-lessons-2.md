# Short lessons for week 2: forty candidates

Written 1 Nov 2026 by Claude Code, step 1 of `docs/week-2-slice.md`. A proposal: nothing imported, nothing built.
Brandon and June pick 28; step 2 writes those into `plan/short-lessons.yaml` (summaries, sources, values points),
and this file stays as the record of why each was offered.

**Picked (1 Nov 2026, Brandon and June):** the 28 marked, with 30 (Braille) in place of 29 (time zones). In run
order: look 1-6; wonder 9-13; listen 17-22; then 25, 26, 27, 28, 30; puzzle 33-38. They are the last 28 lessons of
`plan/short-lessons.yaml`, where their summaries were written and their facts checked. Not taken, and kept here
for later: 7, 8, 14, 15, 16, 23, 24, 29, 31, 32, 39, 40. The vote (34) has no `parent_note`, because a parent note
becomes a parent's part on the first card; its summary says it is about counting only.

## How many of each, and on which day

Week 2 is the family's week 2 of the plan: Egypt topics 8 to 14 on the thread, which sit on wonder, look, listen,
then, puzzle, then, wonder. So week 2 needs **look 6, wonder 5, listen 6, then 5, puzzle 6**, not 28 spread
evenly. A lesson's place in its slot decides its day:

| Day | Date | Egypt (thread) | look | wonder | listen | then | puzzle |
|---|---|---|---|---|---|---|---|
| 1 | Mon 2 Nov | wonder: levers, ramps, sledges and the 3-4-5 rope | 1st | **Egypt** | 1st | 1st | 1st |
| 2 | Tue 3 Nov | look: the Great Sphinx and Hatshepsut's statues | **Egypt** | 1st | 2nd | 2nd | 2nd |
| 3 | Wed 4 Nov | listen: Aida continues, and songs for hauling | 2nd | 2nd | **Egypt** | 3rd | 3rd |
| 4 | Thu 5 Nov | then: Hatshepsut | 3rd | 3rd | 3rd | **Egypt** | 4th |
| 5 | Fri 6 Nov | puzzle: building a pyramid, layer by layer | 4th | 4th | 4th | 4th | **Egypt** |
| 6 | Sat 7 Nov | then: the gods of Egypt (values points 1-4, 12) | 5th | 5th | 5th | **Egypt** | 5th |
| 7 | Sun 8 Nov | wonder: how a mummy was made | 6th | **Egypt** | 6th | 5th | 6th |

Monday's cards show on the wall only if the week is tapped before the boys' Monday session; otherwise Monday's
four short lessons and Egypt topic 8 are built and never seen, and the lessons count as used. The vote lesson
(34) is second in puzzle so that it lands on Tuesday 3 November, Election Day.

Each slot below lists eight in the order I'd run them; **the first six (five for wonder and then) are the 28 I'd
take**, in that order. The rest stay here for week 3 or later.

## How the candidates were found

The same way as the first library (`plan/candidates/short-lessons.md`): the Met (Collection API search, v1.1),
the Art Institute of Chicago (API search, public domain only) and Wikimedia Commons (file search, with each file's
own license). The search code was a throwaway in the session's scratch folder and is not in the repository. Every
item below was then fetched through the real adapters (`core/content/sources.ts`), so its id and license are the
ones `content:fetch` will see: **all 69 came back CC0 or public domain**, and none is Musopen's own site. Each still
goes through the flag model at `content:fetch`, and anything it flags waits at `/parent/content`.

The rules, as before: CC0 or public domain only; no nudity; nothing frightening for a 7-year-old; a real object,
artwork, place or recording before a modern illustration; a recording for a listen lesson. A 1925 or earlier US
recording is public domain in the US since 1 January 2026.

**What the school's tests lean on** (decided 22 Oct) and where it lands: time (29, 39), money (37), length (33),
bar graphs (34, 35), shapes and fractions of shapes (4, 36, 37), multiplication into division (11, 38), word parts
(25, 31), a fable (28), a myth (27), biographies (2, 7, 8, 18, 20, 26, 30, 31); for the younger, a picture to describe
in full sentences (the look slot, 1-8) and plain informational text (the wonder slot, 9-16).

**Hawaiʻi** in every slot: look 5; wonder 10, 13, 14; listen 18, 21; then 26, 27, 32; puzzle 36, 37, 38.
**From the first file's "worth a thought"** list: a vote (34), why ice floats (9), a fraction of a pizza, made a
Hawaiian quilt (36), and time zones (29): four, one more than the brief asked, because each fits a school leaning.

**Values points.** Two are marked: Māui (27, point 4, other religions; a moʻolelo with a demigod, as the 16 Oct
note said of Pele) and the vote (34, point 14, government and voting). Both are marked `several_fairly`. Which way
the family's settings take them shows in `week:build --plan` before anything is spent (step 3 on test, M3 on live);
a lesson the live settings hold back in code is swapped before the build, not after.

**Close to week 1, said plainly.** 11 (speed of sound) sits near whale-song's "sound travels faster in water"; 27 is
a sun myth like Egypt's Ra and the sun boat; 36 folds and cuts cloth as snowflake-six folds paper, but teaches the
fraction, not the symmetry; 38 (arrays) is near Egypt's Friday pyramid-layers puzzle and runs on Sunday, not
beside it. No candidate repeats a week 1 idea name.

---

## look

### 1. snap-the-whip: Diagonal lines, and how Homer makes a still picture move (art)

- **Teaches:** in Winslow Homer's Snap the Whip (1872), boys playing crack the whip outside a red schoolhouse lean
  at slants, and the slanted lines make the still picture look as if it's moving; the two at the end are falling off.
- **The idea named:** diagonal lines.
- **Pictures:** `met-homer-snap-the-whip`: The Met 11140, *Snap the Whip*, Winslow Homer, 1872.
  https://www.metmuseum.org/art/collection/search/11140. CC0. Nine boys in a line in a meadow, the chain bending.
  `met-homer-snap-the-whip-engraving`: The Met 349160, *Snap-the-Whip*, from Harper's Weekly, 1873.
  https://www.metmuseum.org/art/collection/search/349160. CC0. The same scene as a black-and-white engraving.
- **Values points:** none.

### 2. durer-rhinoceros: A description, and the rhinoceros Dürer never saw (art)

- **Teaches:** in 1515 a rhinoceros reached Lisbon; Albrecht Dürer, in Germany, never saw it and made his famous
  print from a letter and a sketch, so it has armour plates and a little horn on its back; how a picture made from
  words is only as good as the words. For the younger: describing a picture in full sentences.
- **The idea named:** a description.
- **Pictures:** `commons-durer-rhinoceros-nga`: Commons, *Albrecht Dürer, The Rhinoceros, 1515, NGA 47903.jpg*.
  https://commons.wikimedia.org/wiki/File:Albrecht_D%C3%BCrer,_The_Rhinoceros,_1515,_NGA_47903.jpg. CC0 (National
  Gallery of Art). The woodcut. `met-durer-rhinoceros`: The Met 356497, *The Rhinoceros*, 1515.
  https://www.metmuseum.org/art/collection/search/356497. CC0. The Met's impression, an alternative to the first.
- **Values points:** none.

### 3. blue-armchair: Body language, in Cassatt's Little Girl in a Blue Armchair (art)

- **Teaches:** Mary Cassatt (1878) painted a girl slumped sideways in a big blue armchair with a small dog asleep in
  the chair beside her; how a pose shows a feeling without a word (bored, tired, fed up).
- **The idea named:** body language.
- **Picture:** `commons-cassatt-blue-armchair-nga`: Commons, *Mary Cassatt, Little Girl in a Blue Armchair, 1878,
  NGA 61368.jpg*. https://commons.wikimedia.org/wiki/File:Mary_Cassatt,_Little_Girl_in_a_Blue_Armchair,_1878,_NGA_61368.jpg.
  CC0 (National Gallery of Art). Four blue armchairs in a bright room, the girl sprawled in the front one.
- **Values points:** none.

### 4. star-tiles: Tessellation, shapes that cover a floor with no gaps (art)

- **Teaches:** some shapes fit together with no gaps and no overlaps, like squares, triangles and hexagons, and
  tile makers fitted eight-pointed stars and crosses; a pattern like that is a tessellation.
- **The idea named:** tessellation.
- **Pictures:** `commons-owen-jones-moresque-5`: Commons, *Owen Jones - Grammar of Ornament - 1868 - plate 043 -
  300ppi.jpg*. https://commons.wikimedia.org/wiki/File:Owen_Jones_-_Grammar_of_Ornament_-_1868_-_plate_043_-_300ppi.jpg.
  Public domain (1868). Owen Jones's colour plate of tile patterns from the Alhambra. `met-tile-panel-stars`: The
  Met 452791, *Tile Panel*, late 13th to first half of the 14th century.
  https://www.metmuseum.org/art/collection/search/452791. CC0. Real cut tiles, stars and six-sided pieces set in
  mortar; photographed on tissue, a little plain.
- **Values points:** none. (If a card says why this art uses patterns rather than people, that is point 1 or 4;
  the summary will not.)

### 5. hawaiian-kapa: Kapa, cloth beaten from bark and stamped with patterns (art; Hawaiʻi)

- **Teaches:** Hawaiian kapa was made by soaking and beating the inner bark of the wauke plant into thin sheets,
  then stamping repeating patterns on it with carved bamboo stamps; lines and triangles repeat across the cloth.
- **The idea named:** kapa.
- **Pictures:** `commons-kapa-hma-1084`: Commons, *Kapa (bark cloth from Hawaii, Honolulu Museum of Art accession
  1084.1.jpg*. https://commons.wikimedia.org/wiki/File:Kapa_(bark_cloth_from_Hawaii,_Honolulu_Museum_of_Art_accession_1084.1.jpg.
  CC0. A whole kapa with stamped stripes and triangles. `commons-kapa-hma-18th-century`: Commons, *Kapa (bark cloth)
  from Hawaii, late 18th-early 19th century, Honolulu Academy of Arts.JPG*.
  https://commons.wikimedia.org/wiki/File:Kapa_(bark_cloth)_from_Hawaii,_late_18th-early_19th_century,_Honolulu_Academy_of_Arts.JPG.
  CC0. An older piece.
- **Values points:** none.

### 6. vermeer-light: The light source, in Vermeer's woman with a water pitcher (art)

- **Teaches:** Johannes Vermeer (about 1662) painted light coming through a window on the left; everything lit is
  on that side and every shadow falls away from it; find where the light comes from and the whole picture makes
  sense.
- **The idea named:** the light source.
- **Picture:** `met-vermeer-water-pitcher`: The Met 437881, *Young Woman with a Water Pitcher*, Johannes Vermeer,
  about 1662. https://www.metmuseum.org/art/collection/search/437881. CC0. A woman at a window with a silver
  pitcher and basin, a map on the wall.
- **Values points:** none.

### 7. rousseau-jungle: Self-taught: Henri Rousseau painted jungles he never saw (art)

- **Teaches:** Rousseau was a Paris toll collector who taught himself to paint; people laughed at his pictures,
  he kept going, and he painted jungles from the plants in Paris's glasshouses and gardens without ever leaving
  France.
- **The idea named:** self-taught.
- **Picture:** `commons-rousseau-equatorial-jungle-nga`: Commons, *Henri Rousseau, The Equatorial Jungle, 1909,
  NGA 46688.jpg*. https://commons.wikimedia.org/wiki/File:Henri_Rousseau,_The_Equatorial_Jungle,_1909,_NGA_46688.jpg.
  CC0 (National Gallery of Art). Thick leaves and flowers, with a monkey and a bird hiding in them; no tiger.
- **Values points:** none. (Close to 2 in kind: both artists drew what they hadn't seen. One of the two is enough
  in a week.)

### 8. ruysch-flowers: Still life, and the flowers that never bloomed together (art)

- **Teaches:** Rachel Ruysch, one of the best-paid painters of her day, painted bouquets of flowers that bloom in
  different seasons, each painted from life on its own and put together in the picture; tiny insects hide among
  them.
- **The idea named:** still life.
- **Picture:** `commons-ruysch-flowers-marble-rijksmuseum`: Commons, *Stilleven met bloemen op een marmeren
  tafelblad, SK-A-2338.jpg*. https://commons.wikimedia.org/wiki/File:Stilleven_met_bloemen_op_een_marmeren_tafelblad,_SK-A-2338.jpg.
  CC0 (Rijksmuseum). Flowers in a glass vase on a marble table, 1716.
- **Values points:** none.

## wonder

### 9. why-ice-floats: Density: why ice floats (science)

- **Teaches:** water grows about a tenth bigger when it freezes, so a chunk of ice weighs less than the same amount
  of water and floats; most of an iceberg is under the water; ponds freeze from the top down, so fish live
  underneath.
- **The idea named:** density.
- **Pictures:** `commons-noaa-iceberg-southern-ocean`: Commons, *Iceberg. Southern Ocean - Flickr - NOAA Photo
  Library.jpg*. https://commons.wikimedia.org/wiki/File:Iceberg._Southern_Ocean_-_Flickr_-_NOAA_Photo_Library.jpg.
  Public domain (NOAA). `commons-noaa-iceberg-revelle`: Commons, *Post0032 - Flickr - NOAA Photo Library.jpg*.
  https://commons.wikimedia.org/wiki/File:Post0032_-_Flickr_-_NOAA_Photo_Library.jpg. Public domain (NOAA). A
  research ship nose to nose with an Antarctic iceberg, for size.
- **Values points:** none.

### 10. rain-shadow: The rain shadow: why one side of an island is wet and the other dry (science; Hawaiʻi)

- **Teaches:** the trade winds push damp air up the mountains from the northeast; it cools, its water falls as
  rain on that side, and the air that comes down the other side is dry; on Kauaʻi, Waiʻaleʻale is one of the
  wettest places on Earth and the west side is dry.
- **The idea named:** the rain shadow.
- **Pictures:** `commons-modis-hawaii-2017`: Commons, *Hawaii (MODIS 2017-08-28).jpg*.
  https://commons.wikimedia.org/wiki/File:Hawaii_(MODIS_2017-08-28).jpg. Public domain (NASA). The islands from
  orbit, clouds piled on their northeast sides. `commons-nasa-waimea-canyon`: Commons, *Waimea Canyon, Kaua'i,
  Image of the Day DVIDS856257.jpg*. https://commons.wikimedia.org/wiki/File:Waimea_Canyon,_Kaua%27i,_Image_of_the_Day_DVIDS856257.jpg.
  Public domain (NASA). The canyon on Kauaʻi's drier side.
- **Values points:** none.

### 11. thunder-after-lightning: The speed of sound: counting from lightning to thunder (science)

- **Teaches:** light from lightning reaches us almost at once, but its sound travels about a mile in five seconds,
  so counting the seconds to the thunder and dividing by five says how many miles away it struck; and why to go
  indoors when thunder roars.
- **The idea named:** the speed of sound.
- **Picture:** `commons-noaa-lightning-oklahoma`: Commons, *Nssl0217 - Flickr - NOAA Photo Library.jpg*.
  https://commons.wikimedia.org/wiki/File:Nssl0217_-_Flickr_-_NOAA_Photo_Library.jpg. Public domain (NOAA, 2009).
  Lightning over Oklahoma at night.
- **Values points:** none. (Near whale-song's "sound travels faster in water"; this one is about light against
  sound.)

### 12. air-pressure: Air pressure, and the horses that couldn't pull two bowls apart (science)

- **Teaches:** in the 1650s Otto von Guericke put two copper half-spheres together and pumped the air out, and two
  teams of horses could not pull them apart; the air all around pushes on everything, and with no air inside
  nothing pushed back.
- **The idea named:** air pressure.
- **Pictures:** `commons-schott-magdeburg-hemispheres`: Commons, *Magdeburg.jpg*.
  https://commons.wikimedia.org/wiki/File:Magdeburg.jpg. Public domain (Gaspar Schott's engraving). The horses
  straining either side of the spheres. `commons-loc-guericke-horses-1672`: Commons, *Teams of horses trying
  unsuccessfully to pull apart vacuum-filled copper spheres ... LCCN92518531.jpg*.
  https://commons.wikimedia.org/wiki/File:Teams_of_horses_trying_unsuccessfully_to_pull_apart_vacuum-filled_copper_spheres,_also_depicted_in_detail_above,_in_Magdeburg_demonstration_for_Emperor_Ferdinand_III_LCCN92518531.jpg.
  Public domain (Library of Congress, from Guericke's book of 1672).
- **Values points:** none.

### 13. bat-echolocation: Echolocation, and Hawaiʻi's own bat (science; Hawaiʻi)

- **Teaches:** the ʻōpeʻapeʻa, the Hawaiian hoary bat, is Hawaiʻi's only native land mammal; it hunts insects in the
  dark by making clicks too high for us to hear and listening for the echoes that bounce back.
- **The idea named:** echolocation.
- **Picture:** `commons-usgs-hawaiian-hoary-bat`: Commons, *Hawaiian hoary bat Lasiurus cinereus semotus.jpg*.
  https://commons.wikimedia.org/wiki/File:Hawaiian_hoary_bat_Lasiurus_cinereus_semotus.jpg. Public domain (Frank
  Bonaccorso, USGS). A frosted grey-brown bat on a branch.
- **Values points:** none.

### 14. seeds-to-hawaii: Seed dispersal: how plants reached islands in the middle of the ocean (science; Hawaiʻi)

- **Teaches:** Hawaiʻi's first plants arrived by wind, wings and waves: tiny seeds blown on the wind, seeds stuck
  to or eaten by birds, and seeds that float; later, voyagers brought canoe plants like the coconut and taro.
- **The idea named:** seed dispersal.
- **Picture:** `commons-nps-sprouted-coconut-kaimu`: Commons, *Visitor Planting Sprouted Coconut, Kaimu,
  Hawaii.jpg*. https://commons.wikimedia.org/wiki/File:Visitor_Planting_Sprouted_Coconut,_Kaimu,_Hawaii.jpg.
  Public domain. A sprouted coconut being planted on black sand. No open photo of a naupaka or ʻōhiʻa seed was found.
- **Values points:** none.

### 15. compass-north: A magnetic field: why a compass points north (science)

- **Teaches:** the Earth is a giant magnet, and a compass needle is a small magnet that turns to line up with it;
  in 1600 William Gilbert showed it with a round magnet he called a little Earth.
- **The idea named:** a magnetic field.
- **Pictures:** `commons-gilbert-terrella`: Commons, *Gilbert De Magnete Illo039.jpg*.
  https://commons.wikimedia.org/wiki/File:Gilbert_De_Magnete_Illo039.jpg. Public domain (1600). The round magnet.
  `commons-gilbert-needles`: Commons, *Gilbert De Magnete Illo011.jpg*.
  https://commons.wikimedia.org/wiki/File:Gilbert_De_Magnete_Illo011.jpg. Public domain. Small needles lining up
  around it. Both are small line drawings.
- **Values points:** none.

### 16. autumn-leaves: Chlorophyll: why leaves turn red and gold in the fall (science)

- **Teaches:** leaves are green because of chlorophyll, which makes food from sunlight; in the fall many trees stop
  making it, the green fades, and the yellows and oranges that were there all along show through; Hawaiʻi has few
  trees that do this.
- **The idea named:** chlorophyll.
- **Pictures:** `aic-tosa-autumn-maples`: The Art Institute of Chicago 127644, *Autumn Maples with Poem Slips*, Tosa
  Mitsuoki, about 1675. https://www.artic.edu/artworks/127644. CC0. Red maple leaves on gold. `aic-inness-autumn-woods`:
  AIC 64736, *Autumn Woods*, George Inness, 1891-94. https://www.artic.edu/artworks/64736. CC0.
- **Values points:** none.

## listen

### 17. carillon-twinkle: The carillon, and one tune with three sets of words (music)

- **Teaches:** a carillon is a tower of tuned bells played from a keyboard with fists and feet; the tune it plays
  here is Twinkle, Twinkle, Little Star, which is also the ABC song and Baa, Baa, Black Sheep, all one melody.
- **The idea named:** the carillon.
- **Recording:** `commons-nps-carillon-twinkle`: Commons, *Twinkle Twinkle Little Star on the Netherlands
  Carillon.ogg*. https://commons.wikimedia.org/wiki/File:Twinkle_Twinkle_Little_Star_on_the_Netherlands_Carillon.ogg.
  Public domain (National Park Service, 2012).
- **Picture:** `commons-highsmith-netherlands-carillon`: Commons, *Looking W at Netherlands Carillon - GW Memorial
  Parkway - Arlington VA USA - between 1980 and 2006.jpg*.
  https://commons.wikimedia.org/wiki/File:Looking_W_at_Netherlands_Carillon_-_GW_Memorial_Parkway_-_Arlington_VA_USA_-_between_1980_and_2006.jpg.
  Public domain (Carol M. Highsmith). The bell tower.
- **Values points:** none.

### 18. steel-guitar: The steel guitar, invented by a Hawaiian schoolboy (music; Hawaiʻi)

- **Teaches:** Joseph Kekuku, a boy at Lāʻie on Oʻahu in the 1880s, slid a piece of metal along his guitar's
  strings and found notes that glide; played flat on the lap, the Hawaiian steel guitar spread around the world.
- **The idea named:** the steel guitar.
- **Recordings:** `commons-ferera-louise-portuguese-tango-1916`: Commons, *Frank Ferera, Helen Louise - Hawaiian
  Portuguese Tango.ogg*. https://commons.wikimedia.org/wiki/File:Frank_Ferera,_Helen_Louise_-_Hawaiian_Portuguese_Tango.ogg.
  Public domain (Victor, 1916). A guitar duet; Ferera was born in Honolulu. Or `commons-ferera-paaluhi-hawaiian-hotel-1925`:
  Commons, *Palakiko & Paaluhi (Ferera & Paaluhi) - Hawaiian Hotel.mp3*.
  https://commons.wikimedia.org/wiki/File:Palakiko_%26_Paaluhi_(Ferera_%26_Paaluhi)_-_Hawaiian_Hotel.mp3. Public
  domain (1925).
- **Picture:** `commons-kekuku-lat-1912`: Commons, *Joseph Kekuku in the Los Angeles Times 1912 (cropped).jpg*.
  https://commons.wikimedia.org/wiki/File:Joseph_Kekuku_in_the_Los_Angeles_Times_1912_(cropped).jpg. Public domain.
  A newspaper portrait, grainy.
- **Values points:** none.

### 19. bumblebee: The chromatic scale: how music buzzes like a bee (music)

- **Teaches:** in Flight of the Bumblebee, Rimsky-Korsakov makes the buzz from runs of notes each a half step apart,
  every white and black key in a row, which is called the chromatic scale, played very fast.
- **The idea named:** the chromatic scale.
- **Recording:** `commons-usaf-rockies-bumblebee-2007`: Commons, *Flight of the Bumblebee - Concert Band - United
  States Air Force Band of the Rockies.mp3*.
  https://commons.wikimedia.org/wiki/File:Flight_of_the_Bumblebee_-_Concert_Band_-_United_States_Air_Force_Band_of_the_Rockies.mp3.
  Public domain (US Air Force, 2007). A band, not strings, so the buzz moves through the woodwinds.
- **Values points:** none.

### 20. maple-leaf-rag: Syncopation, played by Scott Joplin himself (music)

- **Teaches:** ragtime puts the accents between the beats, so the tune seems to arrive early against a steady left
  hand, which is called syncopation; Scott Joplin wrote Maple Leaf Rag in 1899, and this is his own playing, saved
  on a piano roll in 1916.
- **The idea named:** syncopation.
- **Recording:** `commons-joplin-maple-leaf-roll-1916`: Commons, *Maple leaf rag - played by Scott Joplin 1916
  V2.ogg*. https://commons.wikimedia.org/wiki/File:Maple_leaf_rag_-_played_by_Scott_Joplin_1916_V2.ogg. Public
  domain. The roll scanned and played back, so it sounds like a piano, not an old record.
- **Picture:** `commons-joplin-1903`: Commons, *Scott Joplin 19072.jpg*.
  https://commons.wikimedia.org/wiki/File:Scott_Joplin_19072.jpg. Public domain (1903). Small (200 by 260).
- **Values points:** none.

### 21. hawaiian-petrel: Nocturnal: the ʻuaʻu calling in the dark on Haleakalā (science; Hawaiʻi)

- **Teaches:** the ʻuaʻu, the Hawaiian petrel, is a seabird that nests in burrows near the top of Haleakalā, flies
  far out to sea to feed, and comes and goes at night, calling to its mate; an animal that is active at night is
  nocturnal.
- **The idea named:** nocturnal.
- **Recording:** `commons-nps-hawaiian-petrel-haleakala`: Commons, *Hawaiian Petrel Haleakala National Park.ogg*.
  https://commons.wikimedia.org/wiki/File:Hawaiian_Petrel_Haleakala_National_Park.ogg. Public domain (National
  Park Service, 2008).
- **Picture:** `commons-nps-hawaiian-petrel-burrow`: Commons, *Hawaiian Petrel Pterodroma sandwichensis in
  burrow.jpg*. https://commons.wikimedia.org/wiki/File:Hawaiian_Petrel_Pterodroma_sandwichensis_in_burrow.jpg.
  Public domain (National Park Service). Small (504 by 375).
- **Values points:** none.

### 22. mountain-king: Crescendo: In the Hall of the Mountain King (music)

- **Teaches:** Grieg's piece repeats one short tune again and again, getting louder (a crescendo) and faster until
  it crashes at the end; the same tune, changed only in loudness and speed, builds the whole piece.
- **The idea named:** crescendo.
- **Recording:** `commons-musopen-mountain-king`: Commons, *Musopen - In the Hall Of The Mountain King.ogg*.
  https://commons.wikimedia.org/wiki/File:Musopen_-_In_the_Hall_Of_The_Mountain_King.ogg. Public domain (Czech
  National Symphony Orchestra for Musopen, 2012, released to the public domain; a Commons file, so it is read
  like any other).
- **Values points:** none. (The story behind it is trolls chasing Peer Gynt; the cards stay with the music.)

### 23. brahms-lullaby: Triple meter: why a lullaby rocks (music)

- **Teaches:** Brahms's Lullaby counts ONE-two-three, ONE-two-three, like a cradle rocking, which is triple meter;
  a march counts in twos for walking feet.
- **The idea named:** triple meter.
- **Recording:** `commons-schumann-heink-wiegenlied-1915`: Commons, *Brahms - Schumann-Heink - Wiegenlied
  (Berceuse) (1915).ogg*. https://commons.wikimedia.org/wiki/File:Brahms_-_Schumann-Heink_-_Wiegenlied_(Berceuse)_(1915).ogg.
  Public domain (1915). Sung in German by Ernestine Schumann-Heink; crackly.
- **Values points:** none.

### 24. william-tell: The overture: a whole story before the curtain opens (music)

- **Teaches:** Rossini's William Tell Overture (1829) plays before the opera starts, in four parts: dawn, a storm,
  a calm, and the famous gallop with its trumpet call; an overture opens a show.
- **The idea named:** the overture.
- **Recording:** `commons-usmb-william-tell-2000`: Commons, *Gioachino Rossini, William Tell Overture (military band
  version, 2000).ogg*. https://commons.wikimedia.org/wiki/File:Gioachino_Rossini,_William_Tell_Overture_(military_band_version,_2000).ogg.
  Public domain (United States Marine Band, 2000).
- **Values points:** none. (The opera's apple-on-the-head story is left out.)

## then

### 25. tele-words: A root word: tele-, "far", from the telephone to the telescope (literature)

- **Teaches:** tele- is Greek for "far", so a telephone carries sound from far away, a telescope sees far, and
  television shows far-off pictures; Alexander Graham Bell's telephone patent of 1876 named a new thing with an old
  root.
- **The idea named:** a root word.
- **Picture:** `commons-nara-bell-telephone-patent`: Commons, *Alexander Graham Bell's Telephone Patent Drawing and
  Oath - NARA - 302052 (page 2).jpg*. https://commons.wikimedia.org/wiki/File:Alexander_Graham_Bell%27s_Telephone_Patent_Drawing_and_Oath_-_NARA_-_302052_(page_2).jpg.
  Public domain (National Archives). Bell's drawing of 1876.
- **Values points:** none.

### 26. duke-kahanamoku: Heʻe nalu: Duke Kahanamoku takes surfing to the world (history; Hawaiʻi)

- **Teaches:** Duke Kahanamoku of Honolulu won the Olympic 100 metres freestyle swim in 1912 and showed surfing,
  heʻe nalu, "wave sliding", to Australia and California, so Hawaiʻi's sport became the world's.
- **The idea named:** heʻe nalu.
- **Pictures:** `commons-duke-kahanamoku-1912`: Commons, *Duke Kahanamoku 1912.jpg*.
  https://commons.wikimedia.org/wiki/File:Duke_Kahanamoku_1912.jpg. Public domain (Axel Malmström, Stockholm).
  `commons-duke-kahanamoku-surfboard`: Commons, *Anonymous photograph of Duke Paoa Kahanamoku with his surfboard
  (PPWD-13-3-007).jpg*. https://commons.wikimedia.org/wiki/File:Anonymous_photograph_of_Duke_Paoa_Kahanamoku_with_his_surfboard_(PPWD-13-3-007).jpg.
  Public domain (Hawaiʻi State Archives). Standing with a long wooden board. Both in swimming dress of the 1910s.
- **Values points:** none.

### 27. maui-and-the-sun: Moʻolelo: how Māui slowed the sun (literature; Hawaiʻi)

- **Teaches:** in the Hawaiian moʻolelo, Māui climbed Haleakalā, the house of the sun, and snared the sun's rays
  with ropes so it would cross the sky more slowly and his mother Hina's kapa could dry; a moʻolelo is a story
  handed down by telling, and this one explains the long days.
- **The idea named:** moʻolelo.
- **Pictures:** `commons-manookian-maui-snaring-sun`: Commons, *Maui Snaring the Sun by Arman Tateos Manookian,
  c. 1927, drawing, Honolulu Museum of Art.jpg*.
  https://commons.wikimedia.org/wiki/File:Maui_Snaring_the_Sun_by_Arman_Tateos_Manookian,_c._1927,_drawing,_Honolulu_Museum_of_Art.jpg.
  Public domain per Commons (Manookian died 1931). A black-and-white drawing: a small figure on a hill tying the
  sun's rays to a tree. Looked at: nothing a parent would mind. `commons-nps-haleakala-crater`: Commons, *Haleakala
  crater (NPS).jpg*. https://commons.wikimedia.org/wiki/File:Haleakala_crater_(NPS).jpg. Public domain.
- **Values points:** 4 (other religions), perspective several_fairly: Māui is a demigod, as the 16 Oct note said
  of Pele. A sun story like Egypt's Ra and the sun boat (week 1); here the idea is the moʻolelo, not the sun.

### 28. tortoise-and-hare: A moral: The Tortoise and the Hare (literature)

- **Teaches:** in Aesop's fable the hare is so sure of winning that he naps, and the tortoise, slow and steady,
  keeps going and wins; a fable ends with a moral, a short lesson the story was told to teach. Effort, not speed.
- **The idea named:** a moral.
- **Pictures:** `commons-rackham-tortoise-hare-1912`: Commons, *Tortoise and hare rackham.jpg*.
  https://commons.wikimedia.org/wiki/File:Tortoise_and_hare_rackham.jpg. Public domain (Arthur Rackham, 1912).
  `commons-winter-tortoise-hare-1919`: Commons, *The Tortoise and the Hare - Project Gutenberg etext 19994.jpg*.
  https://commons.wikimedia.org/wiki/File:The_Tortoise_and_the_Hare_-_Project_Gutenberg_etext_19994.jpg. Public
  domain (Milo Winter, The Aesop for Children, 1919).
- **Values points:** none.

### 29. time-zones: Time zones: why it is already tomorrow in Japan (geography)

- **Teaches:** the Earth turns once a day, so noon comes to each place at a different time; since 1883 clocks are
  set by time zones, an hour apart, counted from Greenwich in England; when it is 3 pm on Sunday in Hawaiʻi it is
  10 am on Monday in Japan, 19 hours ahead.
- **The idea named:** a time zone.
- **Pictures:** `commons-admiralty-time-zone-chart-1942`: Commons, *World Time Zone Chart 1942.jpg*.
  https://commons.wikimedia.org/wiki/File:World_Time_Zone_Chart_1942.jpg. Public domain (UK Hydrographic Office).
  The world in hour-wide bands. `commons-shepherd-gate-clock`: Commons, *Shepherd Gate clock 2011 1.jpg*.
  https://commons.wikimedia.org/wiki/File:Shepherd_Gate_clock_2011_1.jpg. CC0. The 24-hour clock at Greenwich.
- **Values points:** none.

### 30. louis-braille: Braille: a boy of fifteen invents reading by touch (history)

- **Teaches:** Louis Braille lost his sight as a small child, and at 15 he worked out an alphabet of raised dots,
  six places in a cell, that fingers can read; it is still used today, on signs and in books.
- **The idea named:** braille.
- **Pictures:** `commons-thiriat-louis-braille`: Commons, *Engraving of Louis Braille by Henri Thiriat
  (cropped).jpg*. https://commons.wikimedia.org/wiki/File:Engraving_of_Louis_Braille_by_Henri_Thiriat_(cropped).jpg.
  Public domain (1887). `commons-braille-signs-brisbane-library`: Commons, *Braille signs at Brisbane Square Library
  P1450037.jpg*. https://commons.wikimedia.org/wiki/File:Braille_signs_at_Brisbane_Square_Library_P1450037.jpg. CC0.
  Real braille on signs.
- **Values points:** none.

### 31. sequoyah: A syllabary: Sequoyah writes down Cherokee (history)

- **Teaches:** Sequoyah, who could not read English, spent about twelve years making a sign for each syllable of
  Cherokee, about 85 in all; it was so quick to learn that within a few years thousands of Cherokee could read and
  write.
- **The idea named:** a syllabary.
- **Pictures:** `commons-inman-sequoyah`: Commons, *Henry Inman - Sequoyah - Google Art Project.jpg*.
  https://commons.wikimedia.org/wiki/File:Henry_Inman_-_Sequoyah_-_Google_Art_Project.jpg. Public domain (about
  1830). Sequoyah holding his syllabary. `commons-king-sequoyah-1836`: Commons, *Sequoyah, Cherokee inventor, by C.B.
  King, 1836.jpg*. https://commons.wikimedia.org/wiki/File:Sequoyah,_Cherokee_inventor,_by_C.B._King,_1836.jpg.
  Public domain.
- **Values points:** none. (The Cherokee's forced removal in 1838 would be point 17; the summary leaves it out.)

### 32. iolani-lights: Electric light at ʻIolani Palace, before the White House (history; Hawaiʻi)

- **Teaches:** King Kalākaua met Thomas Edison in 1881, and ʻIolani Palace in Honolulu had electric lights in
  1886, a few years before the White House did.
- **The idea named:** electric light.
- **Pictures:** `commons-eyton-walker-iolani-palace`: Commons, *Iolani Palace, photograph by Frederick George
  Eyton-Walker, c. 1890.jpg*. https://commons.wikimedia.org/wiki/File:Iolani_Palace,_photograph_by_Frederick_George_Eyton-Walker,_c._1890.jpg.
  Public domain. `commons-cogswell-kalakaua`: Commons, *King Kalakaua painted by William Cogswell, Bishop
  Museum.jpg*. https://commons.wikimedia.org/wiki/File:King_Kalakaua_painted_by_William_Cogswell,_Bishop_Museum.jpg.
  Public domain (1876).
- **Values points:** none. (The palace's later history, the overthrow of 1893, is point 17 and is left out, as it
  was for Aloha ʻOe.)

## puzzle

### 33. measuring-feet: A standard unit: when a foot was somebody's foot (math)

- **Teaches:** a foot was once measured with real feet, so it changed with whoever measured; people agreed on one
  length that everyone uses, a standard unit (12 inches); old German surveyors measured fields in rods and feet,
  as in this picture.
- **The idea named:** a standard unit.
- **Picture:** `commons-fotothek-feldmessen-1616`: Commons, *Fotothek df tg 0001710 Geometrie ^ Vermessung ^
  Vermessungsinstrument ^ Messrute ^ Rute ^ Schuh.jpg*.
  https://commons.wikimedia.org/wiki/File:Fotothek_df_tg_0001710_Geometrie_%5E_Vermessung_%5E_Vermessungsinstrument_%5E_Messrute_%5E_Rute_%5E_Schuh.jpg.
  Public domain (1616, Deutsche Fotothek). A man measuring a field with a rod, labelled "9 rods, 4 feet" and "6
  rods, 2 feet" in old German. The well-known woodcut of sixteen men lining up their feet was looked for and not
  found as an open file.
- **Values points:** none.

### 34. how-a-vote-counts: A majority: how a vote is counted (math)

- **Teaches:** counting votes with tally marks; a majority is more than half; the most votes is not always a
  majority when there are three choices; what a tie is; glass ballot boxes let everyone see the box started empty.
  For Tuesday, Election Day; never a party, a candidate or who should win.
- **The idea named:** a majority.
- **Pictures:** `commons-smithsonian-glass-ballot-box`: Commons, *Glass ballot box - Smithsonian.jpg*.
  https://commons.wikimedia.org/wiki/File:Glass_ballot_box_-_Smithsonian.jpg. Public domain (National Museum of
  American History, about 1884). A glass globe on a stand. Small (500 by 600). `commons-smithsonian-wooden-ballot-box`:
  Commons, *Wooden ballot box - Smithsonian.jpg*. https://commons.wikimedia.org/wiki/File:Wooden_ballot_box_-_Smithsonian.jpg.
  Public domain (about 1870).
- **Values points:** 14 (government, voting and parties), perspective several_fairly. The `parent_note` would say
  the cards are about counting only.

### 35. first-bar-chart: The bar chart, invented in 1786 (math)

- **Teaches:** William Playfair drew the first bar chart in 1786 to compare Scotland's trade with other countries:
  each bar's length stands for a number, so the biggest is seen at a glance; reading which is longest, shortest,
  and by how much.
- **The idea named:** a bar chart.
- **Picture:** `commons-playfair-bar-chart-1786`: Commons, *1786 Playfair - Exports and Imports of Scotland to and
  from different parts for one Year from Christmas 1780 to Christmas 1781.jpg*.
  https://commons.wikimedia.org/wiki/File:1786_Playfair_-_Exports_and_Imports_of_Scotland_to_and_from_different_parts_for_one_Year_from_Christmas_1780_to_Christmas_1781.jpg.
  Public domain. Pairs of bars for each country, hand coloured.
- **Values points:** none.

### 36. quilt-eighths: Eighths: a Hawaiian quilt cut from one folded cloth (math; Hawaiʻi)

- **Teaches:** a Hawaiian quilt's pattern is cut from one piece of cloth folded into eighths, so when it is opened
  the pattern has eight matching parts, each one eighth of the whole; fold a square in half, in half again, and
  once more, and count.
- **The idea named:** eighths.
- **Pictures:** `commons-hma-quilt-lei-mamo`: Commons, *Hawaiian quilt, 'Lei Mamo', late 19th century.JPG*.
  https://commons.wikimedia.org/wiki/File:Hawaiian_quilt,_%27Lei_Mamo%27,_late_19th_century.JPG. CC0 (Honolulu
  Museum of Art). `commons-hma-quilt-na-kalaunu`: Commons, *Hawaiian quilt, Na Kalaunu (Crowns),.jpg*.
  https://commons.wikimedia.org/wiki/File:Hawaiian_quilt,_Na_Kalaunu_(Crowns),.jpg. CC0 (before 1918).
- **Values points:** none. (Folds and cuts like week 1's snowflake; the idea here is the fraction.)

### 37. hawaiian-quarter: A quarter: the Kingdom of Hawaiʻi's hapahā (math; Hawaiʻi)

- **Teaches:** in 1883 the Kingdom of Hawaiʻi made its own silver coins; the quarter dollar says HAPAHA, "one
  fourth part", because four of them make a dollar, AKAHI DALA; counting quarters and dimes to a dollar.
- **The idea named:** a quarter.
- **Pictures:** `commons-hawaii-quarter-1883`: Commons, *¼ Dollar 1883 Kalākaua I. vz - MA-Shops.jpg*.
  https://commons.wikimedia.org/wiki/File:%C2%BC_Dollar_1883_Kal%C4%81kaua_I._vz_-_MA-Shops.jpg. Public domain. Both
  sides. `commons-nmah-hawaii-dollar-1883`: Commons, *Hawaii 1883 One Dollar.jpg*.
  https://commons.wikimedia.org/wiki/File:Hawaii_1883_One_Dollar.jpg. Public domain (National Museum of American
  History).
- **Values points:** none. (Counting money, not saving or spending: not point 24.)

### 38. flag-arrays: An array: the stars on the flag in rows (math)

- **Teaches:** the 48-star flag had 6 rows of 8, the 49-star flag of 1959 had 7 rows of 7, and when Hawaiʻi became
  the 50th state the stars went to 5 rows of 6 and 4 rows of 5; rows times columns is multiplication, and sharing
  into equal rows is division.
- **The idea named:** an array.
- **Pictures:** `commons-proposed-48-star-flag-1912`: Commons, *Proposed 48 star American Flag.png*.
  https://commons.wikimedia.org/wiki/File:Proposed_48_star_American_Flag.png. Public domain (Evening Star, 1912).
  `commons-49-star-flag-1959`: Commons, *49-star American Flag (1959).png*.
  https://commons.wikimedia.org/wiki/File:49-star_American_Flag_(1959).png. CC0. Both newspaper drawings, black
  and white.
- **Values points:** none, if the cards say only that Hawaiʻi became a state in 1959. How it came to the United
  States is point 17, and the summary leaves it out.

### 39. base-sixty: Base sixty: why an hour has 60 minutes (math)

- **Teaches:** the Babylonians counted in sixties about 4,000 years ago, and we still do for time: 60 seconds, 60
  minutes; 60 splits evenly into halves, thirds, quarters, fifths, sixths, tenths and twelfths.
- **The idea named:** base sixty.
- **Pictures:** `commons-plimpton-322`: Commons, *Plimpton 322.jpg*.
  https://commons.wikimedia.org/wiki/File:Plimpton_322.jpg. Public domain per Commons. A Babylonian clay tablet of
  numbers. `met-hasius-pair-case-watch`: The Met 194091, *Pair-case watch*, Jacob Hasius, about 1695.
  https://www.metmuseum.org/art/collection/search/194091. CC0.
- **Values points:** none.

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
