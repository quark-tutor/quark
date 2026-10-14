# Prior art and building blocks

As of October 2026, nobody has built this. Pieces exist in separate products, but no project or product found in a broad search combines all five of these:

- a multi-year, knowledge-rich sequence across subjects
- delivery at home (wall screen, car audio, dinner questions)
- a weekly digest that parents steer
- values profiles that parents can see and edit
- an equal say for every guardian, with a blackball

## Closest existing projects

| Project | What it covers | What it misses | Open source? |
| --- | --- | --- | --- |
| [Praeceptor](https://github.com/studylamp/praeceptor) | Self-hosted homeschool tutor built on Claude. Parents read every chat and write their own guidance on how worldview topics are taught. | No multi-year sequence, chat only, a single guardian. Very early. | Yes, MIT |
| [HeyOtto](https://www.heyotto.app/) | Parents set tone, topics and boundaries to match family beliefs (ages 8–18) | Homework help, not a curriculum. One adult per account. | No |
| [Alpha School / TimeBack](https://timeback.com/) | AI academics; its reading app draws on Core Knowledge content | Screen-app and points driven. No parent values controls. | No |
| [Homestead](https://github.com/tbh-23/Homestead) | Homeschool platform for ages 5–13 that sequences skills by prerequisites, with an AI coach for parents | No humanities spine, no values controls | Yes, MIT |
| [Gather 'Round Homeschool](https://www.gatherroundhomeschool.com) | Family unit studies across history, science, art and music | No AI, a single fixed worldview | No |
| [Khanmigo](https://support.khanacademy.org/hc/en-us/articles/21823169137037) | Parents can see their child's chats and get alerts | No values controls, no sequence | No |

Worth reading: "Homeroom: A Value-Aligned and Community-Centered Homeschooling Platform" ([ACM](https://dl.acm.org/doi/10.1145/3772318.3791698)). Not yet reviewed.

## Open-source pieces we could attach instead of building

| Job in our system | Best candidates | Notes |
| --- | --- | --- |
| Content library and delivery | [Kolibri](https://github.com/learningequality/kolibri) (MIT) | Offline-first learning platform with content channels. The AI would build lessons from those channels. |
| Values profile and blackball enforcement | [gpt-oss-safeguard](https://developers.openai.com/cookbook/articles/gpt-oss-safeguard-guide) | An open model that checks content against a written policy. Each family's profile becomes that policy. |
| Safety floor | [Llama Guard 4](https://huggingface.co/meta-llama/Llama-Guard-4-12B), [NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails) (Apache-2.0) | Fixed hazard categories, plus a layer that keeps the Ask box on approved topics |
| Learner model (what each child knows) | [py-fsrs](https://github.com/open-spaced-repetition/py-fsrs), [pyBKT](https://github.com/CAHLR/pyBKT) (MIT) | Spaced review, and estimates of how well a child has mastered each skill |
| Activity log for the parent digest | [SQL LRS](https://github.com/yetanalytics/lrsql) (xAPI, Apache-2.0) | Records what each child did, in a standard format |
| Interactive items | [H5P standalone](https://github.com/tunapanda/h5p-standalone), [Khan Perseus](https://github.com/Khan/perseus), [OATutor](https://github.com/CAHLR/OATutor) (MIT) | Puzzles, quizzes and step-by-step hints |
| Wall screen | [FreeKiosk](https://github.com/RushB-fr/freekiosk) (MIT, Android), or iPad Guided Access | Locks a tablet to one web app |
| Ambient art frame | [InkyPi](https://github.com/fatihak/InkyPi) (e-ink), [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) | A calm screen for the art of the week or a fact of the day |
| Agent architecture reference | [DeepTutor](https://github.com/HKUDS/DeepTutor) (Apache-2.0) | Too heavy to adopt whole, but useful as a design reference |

## Content modules by license

| Status | Sources |
| --- | --- |
| Safe to bundle | Art: [Met](https://metmuseum.github.io/), [Art Institute of Chicago](https://api.artic.edu/docs/), [Cleveland](https://openaccess-api.clevelandart.org/), [National Gallery](https://github.com/NationalGalleryOfArt/opendata), Rijksmuseum public-domain items, Smithsonian CC0 items. Literature: [Gutenberg via Gutendex](https://gutendex.com/), [Standard Ebooks](https://standardebooks.org/feeds), [LibriVox](https://librivox.org/api/info), StoryWeaver. Science: NASA (except third-party images), PhET standard sims (CC BY). History and maps: [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/), Wikidata. Music: [Open Goldberg Variations](https://opengoldbergvariations.org/). Math: Illustrative Math K–5 (original CC BY release). |
| Check each item's license | Europeana, Wikimedia Commons, Free Music Archive, Musopen, IMSLP, iNaturalist, Library of Congress |
| NonCommercial only | Core Knowledge Sequence and its lesson materials, Khan Academy, newer OpenStax editions, David Rumsey maps |
| No reuse | [AmblesideOnline](https://www.amblesideonline.org/license), NRICH, MATHCOUNTS, Art of Problem Solving / Beast Academy, International Children's Digital Library |

## What this means for us

- **Building this isn't a duplicate effort.** We'd be assembling an orchestrator plus a values layer on top of existing open parts, not starting from scratch.
- **Talk to Praeceptor's author first.** It's the closest open project, and it's MIT-licensed.
- **The Core Knowledge Sequence is NonCommercial.** We can follow its topic order, since a list of topics isn't copyrightable, but we can't bundle its text. AmblesideOnline can only be linked to, and the same goes for Beast Academy.
- **Museum art collections include nudity and violence,** so art is never shown straight from search results. Each item is tagged by a model first; CC0 and public-domain items with no flag are approved automatically, and flagged items wait for a guardian.

The search and license checks were done in October 2026. Confirm star counts and any licenses marked as unverified before relying on them.
