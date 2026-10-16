# Ancient Egypt: picture and recording candidates

Phase 3, step 2b. Candidates for the 15 topics in `plan/ancient-egypt.yaml` that have no sources, so that every topic, puzzles included, has one or two approved items. Brandon picks; nothing here is in the plan yet.

Found on 15 Oct 2026 by searching the Met (Collection API v1.1 search), the Art Institute of Chicago (API search, public domain only) and Wikimedia Commons (file search, then each file's own license through `extmetadata`, the same field `core/content/commons.ts` reads). The search code was a throwaway and isn't in the repo.

Rules applied to every candidate:

- CC0 or public domain only. Met and AIC items are `isPublicDomain` / `is_public_domain`; Commons items carry the license their file page states.
- No nudity, nothing frightening for a 7-year-old. No mummy faces were needed, so none are listed.
- A real object or place that shows the topic's mechanism, before any modern illustration.
- "Listen" topics get recordings, from Commons (Musopen is checked by hand and never approved automatically).

Each item still goes through `content:fetch`, where the flag model looks at it; anything it flags waits at `/parent/content`.

**Suggested** marks the one or two I'd take. Item ids are written the way the plan's `sources` would name them.

---

## Week 1, then: The Nile, from source to sea (geography)

1. **Suggested.** `commons-nile-night`: Commons, *Nile River Delta at Night cropped.JPG*. https://commons.wikimedia.org/wiki/File:Nile_River_Delta_at_Night_cropped.JPG. Public domain (NASA, ISS Expedition 25 crew). Shows Egypt from space at night: a thin line of city lights along the river and a fan of lights in the delta, dark desert on both sides. Why: it shows the summary's main point, that nearly everyone lives beside the water.
2. **Suggested.** `commons-nile-green-strip`: Commons, *NileDelta - Green earth.png*. https://commons.wikimedia.org/wiki/File:NileDelta_-_Green_earth.png. Public domain (NASA/NOAA). Shows a daytime satellite view of the green strip and green delta inside brown desert. Why: Kemet and Deshret, the black land and the red land, in one picture.
3. `commons-nile-source-aster`: Commons, *Source of the Nile River (ASTER).jpg*. https://commons.wikimedia.org/wiki/File:Source_of_the_Nile_River_(ASTER).jpg. Public domain (NASA/METI). Shows where the Nile leaves Lake Victoria at Jinja, Uganda. Why: the "source" end of the topic. Less striking for a child than 1 or 2.

## Week 1, wonder: Why the Nile flooded (science)

1. **Suggested.** `met-ipuy-garden-shaduf`: Met 557816, *Garden Scene, Tomb of Ipuy* (facsimile, Norman de Garis Davies). https://www.metmuseum.org/art/collection/search/557816. CC0. Shows gardeners lifting water from a pool with a shaduf, a counterweighted pole and bucket. Why: shows how water was moved to the fields when the flood wasn't there.
2. **Suggested.** `commons-elephantine-nilometer-plate`: Commons, *Île d'Éléphantine. Plan, élévation, coupe et détails d'un nilometre* (Description de l'Égypte, NYPL copy). https://commons.wikimedia.org/wiki/File:Île_d'Éléphantine._Plan,_élévation,_coupe_et_détails_d'un_nilometre_(NYPL_b14212718-1267862).jpg. Public domain. Shows a plan and cut-away of the Elephantine nilometer, a stairway down into the river, and close-ups of the marked scale on its wall. Why: the clearest view of how a nilometer measured the flood. It's an 1809 engraving of a real place.
3. `commons-kom-ombo-nilometer`: Commons, *Nilometer, Kom Ombo Temple, Kom Ombo, AG, EGY (48005011751).jpg*. https://commons.wikimedia.org/wiki/File:Nilometer,_Kom_Ombo_Temple,_Kom_Ombo,_AG,_EGY_(48005011751).jpg. CC0 (Warren LeMay). Shows a modern photo of the round, stone-lined nilometer well at Kom Ombo, lit at night. Why: a real nilometer today, but the scale marks don't show, so 2 explains more.

No good open photo of a nilometer's scale marks was found: the clear Cairo and Elephantine photos are CC BY or CC BY-SA.

## Week 1, then: Ra and the sun boat (literature)

1. **Suggested.** `met-solar-boat-papyrus`: Met 553484, *Papyrus fragment with a painting of Khepri, Shu, Tefnut, Thoth, and Isis in a solar boat*. https://www.metmuseum.org/art/collection/search/553484. CC0. Shows a simple ink drawing of gods sitting in a curved boat. Why: the sun boat itself, as an Egyptian drew it.
2. **Suggested.** `met-meketre-travelling-boat`: Met 544213, *Travelling Boat being Rowed* (model from the tomb of Meketre). https://www.metmuseum.org/art/collection/search/544213. CC0. Shows a painted wooden model of a Nile boat with rowers and a cabin. Why: a real Nile boat, the kind Egyptians imagined Ra sailing. It also looks good if the topic comes back later in the week.
3. `commons-set-spears-apep`: Commons, *Set speared Apep.jpg* (Book of the Dead of Cheritwebeshet). https://commons.wikimedia.org/wiki/File:Set_speared_Apep.jpg. Public domain. Shows a god standing in the sun boat spearing the serpent Apophis. Why: the night battle from the summary. A spear in a snake may be flagged `violence` and wait for a guardian, so it's third.

## Week 1, puzzle: Egyptian number signs (math)

1. **Suggested.** `met-seventy-deben-weight`: Met 546696, *Seventy deben weight*. https://www.metmuseum.org/art/collection/search/546696. CC0. Shows a speckled stone weight carved with a king's cartouche and, below it, seven heel-bone signs: 70. Why: a real object with number signs a child can count, and the same weight works for the week 3 balance puzzle.
2. **Suggested.** `commons-sethe-numeral-table`: Commons, *A History Of Mathematical Notations Vol I - Egyptian numerals...* (Cajori, 1928, table compiled by Kurt Sethe). https://commons.wikimedia.org/wiki/File:A_History_Of_Mathematical_Notations_Vol_I_-_Egyptian_numerals._Hieroglyphic,_hieratic,_and_demotic_numeral_symbols._(This_table,_was_compiled_by_Kurt_Sethe.).png. Public domain (published in the US in 1928). Shows a chart of the signs for 1-9, 10-90, 100-900 and 1,000-9,000 in hieroglyphic, hieratic and demotic. Why: the decoding chart the puzzle needs. It's a printed table, not a photo, but it's a scholar's copy of the real sign forms.
3. `commons-palermo-stone-plate`: Commons, *Palermo Ston fragment-Akademie der Wissenschaften Berlin.jpg* (plate from 1902). https://commons.wikimedia.org/wiki/File:Palermo_Ston_fragment-Akademie_der_Wissenschaften_Berlin.jpg. Public domain. Shows the Palermo Stone's royal annals, which record each year's flood height in number signs. Why: links the numbers to the flood, but the signs are small and someone has added yellow row numbers to the plate.

## Week 2, then: Khufu, Giza and the people who built the pyramids (history)

1. **Suggested.** `commons-bonfils-khufu`: Commons, *Giza, Pyramids, Pictures, F. Bonfils, photo 4 of 27 - Archivio fotografico Museo Egizio, Turin INV01 006.jpg*. https://commons.wikimedia.org/wiki/File:Giza,_Pyramids,_Pictures,_F._Bonfils,_photo_4_of_27_-_Archivio_fotografico_Museo_Egizio,_Turin_INV01_006.jpg. CC0 (Museo Egizio). Shows an 1880s photograph of Khufu's pyramid with people at its foot. Why: the Great Pyramid, with people in the picture to show its size.
2. **Suggested.** `commons-giza-excavation-1903`: Commons, *Schiaparelli's excavations - Giza, Landscape and unknown mastabas..., 1903, photo 8 of 22 - Archivio fotografico Museo Egizio, Turin INV87 006.jpg*. https://commons.wikimedia.org/wiki/File:Schiaparelli's_excavations_-_Giza,_Landscape_and_unknown_mastabas,_Landscape_and_unknown_areas,_1903,_photo_8_of_22_-_Archivio_fotografico_Museo_Egizio,_Turin_INV87_006.jpg. CC0 (Museo Egizio). Shows workmen digging at Giza in 1903. Why: shows how we know who built the pyramids, by digging, and works as a second look for the same topic.
3. `commons-rijks-khufu-causeway`: Commons, *Gezicht op de Piramide van Cheops Pyramid Gizeh Egypt.jpg*. https://commons.wikimedia.org/wiki/File:Gezicht_op_de_Piramide_van_Cheops_Pyramid_Gizeh_Egypt.jpg. CC0 (Rijksmuseum). Shows Khufu's pyramid and the remains of its causeway, the road from the river temple up to the pyramid. Why: a good second view, but 1 and 2 cover more.

No open photo of the workers' town or bakeries was found.

## Week 2, wonder: Levers, ramps, sledges and the rope that makes a right angle (science)

1. **Suggested.** `commons-djehutihotep-colossus`: Commons, *C+B-Egypt-Fig8-DraggingDhnthotepStatue.PNG* (Encyclopaedia Biblica, 1903). https://commons.wikimedia.org/wiki/File:C%2BB-Egypt-Fig8-DraggingDhnthotepStatue.PNG. Public domain. Shows a line drawing of the Djehutihotep tomb painting: a giant statue on a sledge, rows of men on ropes, a man pouring water in front of the sledge and a man on the statue clapping the beat. Why: the summary's exact scene, wet sand and all. It's an old copy of a real painting.
2. **Suggested.** `met-senwosret-sledge`: Met 545485, *Sledge from mortuary complex of Senwosret I*. https://www.metmuseum.org/art/collection/search/545485. CC0. Shows a real wooden sledge used to drag heavy loads. Why: the machine itself, not a picture of it.
3. `met-dragging-thutmose-statue`: Met 557800, *Dragging a Statue of Thutmose I* (facsimile, tomb of Userhat). https://www.metmuseum.org/art/collection/search/557800. CC0. Shows men and women hauling a statue on ropes. Why: a second hauling scene in color.

No open picture of a knotted 3-4-5 rope was found. That part of the topic stays text only.

## Week 2, then: Hatshepsut, the woman who ruled as pharaoh (literature)

The look card this week already uses three Met statues of Hatshepsut, so these show her reign instead.

1. **Suggested.** `commons-punt-relief-cast`: Commons, *Queen Hatshepsut's expedition to Punt, plaster cast of her mortuary temple at Deir el-Bahri... Royal Ontario Museum - DSC09766.JPG*. https://commons.wikimedia.org/wiki/File:Queen_Hatshepsut's_expedition_to_Punt,_plaster_cast_of_her_mortuary_temple_at_Deir_el-Bahri,_Western_Thebes,_Egypt_-_Royal_Ontario_Museum_-_DSC09766.JPG. CC0 (Daderot). Shows a cast of the temple relief of her ships sailing to Punt. Why: the expedition from the summary.
2. **Suggested.** `commons-deir-el-bahri-beato`: Commons, *Theban region, Deir el-Bahari, 19th century pictures, 1870-1888, photo 1 of 1 - Archivio fotografico Museo Egizio, Turin INV27 006.jpg*. https://commons.wikimedia.org/wiki/File:Theban_region,_Deir_el-Bahari,_19th_century_pictures,_1870-1888,_photo_1_of_1_-_Archivio_fotografico_Museo_Egizio,_Turin_INV27_006.jpg. CC0 (Antonio Beato, Museo Egizio). Shows the temples at Deir el-Bahri under the cliffs, before they were restored. Why: her great temple, as it was found.
3. `met-hatshepsut-cartouche-plaque`: Met 554407, *Cartouche Plaque of Hatshepsut*. https://www.metmuseum.org/art/collection/search/554407. CC0. Shows a small faience plaque with her throne name in a cartouche. Why: her name, which was later chipped off walls. Small and plain on its own.

## Week 2, puzzle: Building a pyramid, layer by layer (math)

1. **Suggested.** `commons-djoser-step-pyramid`: Commons, *Saqqara, Pyramid of Djoser and nearby tombs, Pictures, F. Bonfils, photo 3 of 8 - Archivio fotografico Museo Egizio, Turin INV01 002.jpg*. https://commons.wikimedia.org/wiki/File:Saqqara,_Pyramid_of_Djoser_and_nearby_tombs,_Pictures,_F._Bonfils,_photo_3_of_8_-_Archivio_fotografico_Museo_Egizio,_Turin_INV01_002.jpg. CC0 (Museo Egizio). Shows the Step Pyramid at Saqqara with its six stacked layers. Why: you can count the layers, each smaller than the one below, which is the puzzle.
2. **Suggested.** `met-pyramidion-iufaa`: Met 552805, *Pyramidion of Iufaa*. https://www.metmuseum.org/art/collection/search/552805. CC0. Shows a small stone pyramid cap carved with figures and hieroglyphs. Why: a real pyramid shape to hold in mind, with the wide base the summary says keeps it from tipping.
3. `commons-rhind-papyrus` (already in the plan): the Rhind Papyrus has the pyramid-slope problems, but the plan's detail shows the first section, not those problems.

## Week 3, then: The gods of Egypt, temples and the pharaoh (history)

1. **Suggested.** `met-temple-of-dendur`: Met 547802, *The Temple of Dendur*. https://www.metmuseum.org/art/collection/search/547802. CC0. Shows the whole small sandstone temple, gateway and shrine, inside the Met. Why: a god's house, the summary's main idea, small enough to take in at once.
2. **Suggested.** `met-striding-thoth`: Met 544092, *Striding Thoth*. https://www.metmuseum.org/art/collection/search/544092. CC0. Shows a faience figure of Thoth with an ibis head. Why: one god with his animal, for "each god had a job and an animal".
3. `met-dendur-photo-1870`: Met 261776, *Temple d'Andour* (photograph, about 1870). https://www.metmuseum.org/art/collection/search/261776. CC0. Shows the same temple in Nubia, where it stood before it was moved. Why: a second view of the temple if the topic comes back.

## Week 3, wonder: How a mummy was made, and why it worked (science)

1. **Suggested.** `met-natron-bag`: Met 587568, *Bag of Natron from Tutankhamun's Embalming Cache*. https://www.metmuseum.org/art/collection/search/587568. CC0. Shows a small tied linen bag with pale natron powder spilling out beside it. Why: the drying salt itself, the mechanism in the summary, with no body in the picture.
2. **Suggested.** `met-embalmers-swab`: Met 552545, *Embalmer's Swab*. https://www.metmuseum.org/art/collection/search/552545. CC0. Shows a palm-wood stick wrapped in linen with natron. Why: a real embalmer's tool, still gentle for a 7-year-old.
3. `met-tut-embalming-linen`: Met 548836, *Linen from Tutankhamun's Embalming Cache*. https://www.metmuseum.org/art/collection/search/548836. CC0. Shows linen left over from the wrapping. Why: the wrapping step, without a mummy in view.

## Week 3, then: Isis and Osiris, and the cat in Egypt (literature)

The look card this week already has two Met cats, so the first picks show the myth.

1. **Suggested.** `met-isis-nursing-horus`: Met 553002, *Statuette of Isis nursing Horus*. https://www.metmuseum.org/art/collection/search/553002. CC0. Shows a bronze figure of Isis seated with the child Horus on her lap. Why: Isis and her son, who grew up to defeat Set.
2. **Suggested.** `met-osiris-statuette`: Met 553005, *Statuette, Osiris*. https://www.metmuseum.org/art/collection/search/553005. CC0. Shows Osiris as king of the dead, wrapped, with crook and flail. Why: Osiris as the story leaves him.
3. `aic-bastet-cat-amulet`: AIC 140354, *Amulet of the Goddess Bastet as a Seated Cat*. https://www.artic.edu/artworks/140354. CC0. Shows a small faience seated cat. Why: the cat half of the topic, if both cats in the look card aren't enough.

## Week 3, puzzle: A balance scale, and a cartouche for your name (math)

1. **Suggested.** `met-nebamun-craftsmen`: Met 548568, *Craftsmen, Tomb of Nebamun and Ipuky* (facsimile). https://www.metmuseum.org/art/collection/search/548568. CC0. Shows workshops; top left, a man weighs gold on a tall balance. Why: a real Egyptian balance in use, apart from the weighing of the heart.
2. **Suggested.** `met-hatshepsut-tally-cartouche`: Met 555098, *Tally stone from Hatshepsut's Valley Temple*. https://www.metmuseum.org/art/collection/search/555098. CC0. Shows a limestone block carved with one big, clear cartouche of Hatshepsut's throne name, Maatkare. Why: the clearest cartouche found, the shape the child draws around their own name.
3. `met-seventy-deben-weight` (also offered for week 1): a balance weight with a cartouche on it, so it fits both halves of this puzzle.
4. `met-bulls-head-weight`: Met 548729, *Bull's-Head Weight of 2 Deben*. https://www.metmuseum.org/art/collection/search/548729. CC0. Shows a bronze weight shaped like a bull's head. Why: a weight a child would remember.

## Week 4, wonder: How papyrus is made, and how archaeologists date what they find (science)

1. **Suggested.** `met-blank-papyrus-sheet`: Met 552619, *Papyrus sheet* (blank). https://www.metmuseum.org/art/collection/search/552619. CC0. Shows a long, unwritten sheet with the strips of pith running across it. Why: you can see how it was made.
2. **Suggested.** `commons-excavation-layers`: Commons, *Archäologie schichtengrabung.jpg*. https://commons.wikimedia.org/wiki/File:Archäologie_schichtengrabung.jpg. Public domain (Anja Mößbauer). Shows a dig in Augsburg cut straight down, the soil layers in stripes. Why: stratigraphy in one picture. It's in Germany, not Egypt.
3. `commons-papyrus-plant-bruce`: Commons, *James Bruce - Cyperus papyrus L (Papyrus Sedge), finished drawing of inflorescence...*. https://commons.wikimedia.org/wiki/File:James_Bruce_-_Cyperus_papyrus_L_(Papyrus_Sedge),_finished_drawing_of_inflorescence_-_B1977.14.9119_-_Yale_Center_for_British_Art.jpg. CC0 (Yale Center for British Art). Shows an 18th-century drawing of the papyrus plant's head. Why: the plant itself. No open photo of a living papyrus plant came up.

No open picture of papyrus being made (strips laid and pressed) was found.

## Week 4, listen: How a reed flute makes a note, and the family's pick (music)

Recordings, from Commons:

1. **Suggested.** `commons-flute-f-major-scale`: Commons, *F-durskala.ogg*. https://commons.wikimedia.org/wiki/File:F-durskala.ogg. Public domain (CarinaT). 22 seconds: a scale played on a concert flute. Why: you hear the note go up as each hole opens and the column of air gets shorter, which is the mechanism. It's a modern flute, not a reed flute.
2. **Suggested.** `commons-shakuhachi-honkyoku`: Commons, *Shikanotoone.ogg*. https://commons.wikimedia.org/wiki/File:Shikanotoone.ogg. Public domain per its page (Araki Kodō III, Victor 13029). Six minutes of a shakuhachi, an end-blown bamboo flute that works like the ney. Why: the nearest open recording to an end-blown reed flute. Check: the page doesn't give a recording date, and a US public-domain claim needs it to be before 1926.
3. `commons-debussy-syrinx`: Commons, *Debussy - Syrinx.ogg*. https://commons.wikimedia.org/wiki/File:Debussy_-_Syrinx.ogg. Public domain (performed by Sarah Bassingthwaite). 2½ minutes of solo flute. Why: a beautiful solo flute piece, named for the reed pipes of Greek myth.
4. `commons-shakuhachi-440`: Commons, *Shakuhachi-flute-440Hz.ogg*. https://commons.wikimedia.org/wiki/File:Shakuhachi-flute-440Hz.ogg. CC0. One 9-second note on a shakuhachi. Why: one clear note if a short example is wanted.

For "the family's pick", the topic can also name `commons-aida-march` (already in the plan) or the Handel recording below. No open recording of an Egyptian ney was found.

## Week 4, then: A day as a scribe's child (literature)

1. **Suggested.** `met-apprentice-writing-board`: Met 545112, *Writing board of an apprentice scribe*. https://www.metmuseum.org/art/collection/search/545112. CC0. Shows a whitewashed board covered in a pupil's copied hieroglyphs: birds, a seated man, signs in rows. Why: a scribe's child's own homework.
2. **Suggested.** `met-hieratic-account-ostracon`: Met 561398, *Hieratic ostracon with account*. https://www.metmuseum.org/art/collection/search/561398. CC0. Shows a flake of limestone with writing in ink. Why: the cheap writing surface the summary describes, used instead of papyrus.
3. `met-meketre-granary-scribes`: Met 545281, *Model of a Granary with Scribes*. https://www.metmuseum.org/art/collection/search/545281. CC0. Shows a wooden model of scribes counting sacks of grain into a storehouse. Why: what a scribe's child was training to do.

---

## Also worth deciding

Not among the 15, but each would otherwise stay text only or wait at `/parent/content`:

- **Week 3, listen: Handel's Israel in Egypt.** Its only source is Musopen, which is never approved automatically. Alternative: `commons-israel-in-egypt-1888`, Commons, *Israel In Egypt 1888 06 29 Restored.ogg*. https://commons.wikimedia.org/wiki/File:Israel_In_Egypt_1888_06_29_Restored.ogg. Public domain (Col. George Gouraud, Edison cylinder). Two minutes of a huge choir at the Crystal Palace in 1888, one of the oldest music recordings there is. It's crackly, but a child might find "the oldest recording of music" a good story in itself. Add it beside Musopen, or instead of it?
- **Week 4, then: Scribes, the Rosetta Stone and Tutankhamun's tomb.** Its photo, `commons-rosetta-stone`, is CC BY-SA 4.0, so it will wait for a guardian rather than pass automatically. Open alternatives: `commons-rosetta-1985`, Commons, *Rosetta-stone-display-in-1985.jpg* (https://commons.wikimedia.org/wiki/File:Rosetta-stone-display-in-1985.jpg, CC0, RickDikeman), with visitors looking at the stone in the British Museum; and `commons-carter-in-tomb`, Commons, *Howard Carter in the King Tutankhamen's tomb.jpg* (https://commons.wikimedia.org/wiki/File:Howard_Carter_in_the_King_Tutankhamen's_tomb.jpg, public domain, Harry Burton), with Carter working at the shrine doors.
