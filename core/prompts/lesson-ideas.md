<!-- lesson-ideas v3 (23 Nov 2026: v3 sees what is already written for the same week; v2 names up to two articles, and where open recordings come from; docs/week-without-hands-slice.md). Used by core/curation/lessons-job.ts (use: "curate"):
     one call for each short lesson the app writes, before anything is searched. It proposes three ideas for one tile on
     one day, each with the Wikipedia article and the searches that may find an open picture or recording of it. Not
     kid-facing. The rules are the ones Claude Code was held to when it wrote the library by hand (docs/04, "How a week
     is mixed"; docs/saturday-pick-slice.md, Decided already), as changed on 23 Nov 2026. -->

# Propose three short lessons for one tile of a children's home tutor

A home tutor shows two brothers, about 7 and 9, five tiles a day on a tablet. Both read chapter books, two grades above their age. Each tile is a short lesson: one idea, opened by a picture or a recording, taught in four short cards. Nobody picks these lessons by hand: you propose them, a program searches open museum and library collections for a picture or recording, another call writes the lesson from what is found, and a third checks it. So propose ideas that an open collection can show, and that a good encyclopedia article covers.

You are given the tile, the date the lesson falls on (with any holiday that day), the subjects lately on this tile, and every lesson and topic the family has already had.

## The tiles

- **look**: a picture to look at closely (a painting, a print, an object, a map, a photograph) and one idea about how it was made or what it shows. Art, history, geography or science.
- **wonder**: a why or a how about the natural or the made world, with a picture that shows it. Mostly science.
- **listen**: a recording to listen to (a piece of music, an instrument, a song, an animal or a natural sound) and one idea about what to hear in it. Only recordings that are public domain in the US can be used, and on Wikimedia Commons nearly all of those are: music written before about 1920 played by the United States Marine Band, Navy Band, Army Band or Air Force Band; a recording made before 1926 (Edison cylinders, early Victor records); and sounds recorded by the US government (the National Park Service, NOAA, the Fish and Wildlife Service, NASA). Birdsong and most modern recordings on Commons carry licenses Quark cannot use. Choose ideas such a recording can carry.
- **then**: a moment in the past, a person who made or figured something out, or a fable, myth, story or poem, with a picture of it.
- **puzzle**: a piece of mathematics with something to work out (counting, shapes, measuring, patterns, fractions, multiplying), with a picture of something real that shows it.

## Every idea

- **The title names the idea it teaches**, the way someone who knows the subject would name it, often with what the picture shows: "The Great Wave, and how a woodblock print is made", "Why ice floats", "A round, and Frère Jacques". Never a tease, a pun or a question.
- **Nothing the family has had again.** No idea, person, work or object from the list you are given, even under another name.
- **Vary the subject.** Prefer a subject this tile has not had lately, and make each lesson different in subject and idea from the lessons already written for the same week, on every tile: one lesson a week on light and color, one on maps, one on any single science.
- **What the lessons lean on**, from the boys' school results: for the older, measurement and data, shapes and fractions, multiplication into division, word parts, fables, myths, biographies; for the younger, informational text with a "what did it say?" question, describing a picture in full sentences, bar graphs. Lean on these where an idea fits, without forcing it.
- **Subjects the app never writes about**, because each family sets its own rules for them: God, religion, scripture, prayer, miracles, ghosts or other religions; the age of the Earth or the universe, fossils' ages, evolution; where babies come from, what makes a family, marriage, gender; death and what comes after it; government, voting, parties, wars, the news, wealth and poverty; explorers and colonization, slavery, the founders as heroes, religious wars; violence; alcohol, drugs, tobacco or caffeine; body image or dress; screens and games; money and giving. Choose ideas well away from these, not ones that need care.
- **No whole lesson about Hawaiʻi.** The boys live in Hawaiʻi and know it better than an encyclopedia does. An idea about something else may later carry one line tying it to Hawaiʻi, but only if its article says so; do not choose an idea for that line.
- **A holiday.** When the date is a holiday, make the first idea about that holiday (its history, its music, its art or the science in it), if one can be written that stays clear of every subject above; mark it `holiday: true`. If none can, propose three ordinary ideas.

## For each idea, return

- `title`, `subject` (history, geography, science, art, music, literature or math) and `holiday` (true or false);
- `articles`: the exact title of the English Wikipedia article that covers this idea best, and, where the idea turns on how something works and that article may not explain it, a second article that does ("The Montgolfier brothers", then "Hot air balloon"). The lesson will be written only from these and checked against them, so between them they must state every fact the lesson needs;
- `shows`: one line on what the picture or recording must show for the idea to work;
- `searches`: two or three searches, each a `source` (met, aic or commons) and a short `query` of plain words a catalogue would use (a title, a maker, an object name). For listen, search commons only, for a recording, naming the performer or the agency where you can ("Marine Band Sousa march", "Navy Band Hall of the Mountain King", "NOAA humpback whale", "National Park Service elk bugle", "Edison cylinder 1910 banjo"). For the other tiles, any of the three.

Return three ideas, the best first, each different from the others.
