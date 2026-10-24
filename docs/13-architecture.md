# Architecture and tech stack

We build two things: the tutor core and the policy gate. Everything else is an existing open-source part or a swappable outside service. The data stays with the family.

```mermaid
flowchart TB
  subgraph touch["Touch points: what the family sees"]
    direction LR
    wall["Wonder Wall<br/>web app on a tablet<br/><i>FreeKiosk, iPad lock</i>"]
    frame["Ambient frame<br/>art + music of week<br/><i>InkyPi, MagicMirror</i>"]
    car["Car audio<br/>private podcast feed<br/><i>any podcast app</i>"]
    parent["Parent digest<br/>weekly email + app<br/><i>values, blackballs</i>"]
  end
  subgraph gate["Policy gate: nothing reaches a child unchecked"]
    direction LR
    values["Values + blackball<br/>family policy as plain text<br/><i>gpt-oss-safeguard</i>"]
    floor["Safety floor<br/>fixed hazard checks<br/><i>Llama Guard + NeMo</i>"]
    consent["Guardians + consent<br/>equal say, opt-in sharing<br/><i>sign-in + audit log</i>"]
  end
  subgraph core["Tutor core: the part we build"]
    direction LR
    curation["Curation engine<br/>weekly plan + cards<br/><i>LLM agent, cron job</i>"]
    session["Tutor session<br/>hints, difficulty<br/><i>voice first for kids</i>"]
    learner["Learner model<br/>delayed recall<br/><i>py-fsrs, pyBKT</i>"]
    digest["Digest builder<br/>what stuck, next<br/><i>report per child</i>"]
  end
  subgraph data["Data: owned by the family"]
    direction LR
    plan["Learning plan<br/>multi-year plan data<br/><i>topic graph (git)</i>"]
    library["Content library<br/>approved, kid-safe<br/><i>Kolibri + allowlist</i>"]
    profiles["Family profiles<br/>interests, consent<br/><i>encrypted, local</i>"]
    log["Activity log<br/>answers, checks<br/><i>xAPI via SQL LRS</i>"]
  end
  subgraph outside["Outside services: swappable"]
    direction LR
    apis["Open content APIs<br/>Met, AIC, Gutenberg, NASA<br/><i>public domain or CC</i>"]
    llm["Language model<br/>Claude, GPT or local Ollama<br/><i>provider-agnostic</i>"]
    voice["Voice + media<br/>speech in, read-aloud out<br/><i>Whisper, Piper (open)</i>"]
  end
  core -->|cards, hints, audio, digest| gate
  gate -->|only what passes the gate| touch
  touch -->|every answer logged| data
  data -->|plan, profiles, history| core
  outside -->|content fetched and filtered| data
  llm -.->|model calls| core
```

The core writes cards, hints and the digest. Every one of them passes through the policy gate before a child sees it. Everything a child does is logged, and the core reads that log, the plan and the profiles to decide what comes next. Outside services are behind interfaces so any of them can be replaced.

## What each layer needs

| Layer | What we need to decide | Likely choices |
| --- | --- | --- |
| Touch points | A kid-facing web app that works on a locked tablet, with voice. An ambient display. Audio that reaches the car without a special app. A parent interface. | One web app (React or Svelte) in FreeKiosk or iPad Guided Access. InkyPi or MagicMirror² for the frame. A private RSS podcast feed for the car. Parent digest by email, plus a small web app for settings. |
| Policy gate | Turn a family's values profile into something a machine can enforce. A fixed safety floor nobody can switch off. Guardian sign-in with equal weight and a full audit trail. | gpt-oss-safeguard with the profile as its policy. Llama Guard 4 for the floor, NeMo Guardrails around the Ask box. A simple auth system (for example Keycloak or Auth.js) with every decision logged. |
| Tutor core | The weekly curation job, the live tutoring session, the learner model and the digest. This is the orchestrator and most of the project's own code. | Python (FastAPI) services. A scheduled job for curation. py-fsrs and pyBKT for the learner model. Prompts and teaching rules kept as versioned files so the community can improve them. |
| Data | The multi-year plan as data, the approved content library, family and child profiles, and the activity log. | The plan as a topic graph in the repo (JSON or YAML, versioned in git). Kolibri or a plain database for content. Postgres or SQLite for profiles, encrypted at rest. SQL LRS (xAPI) for the log, so the data is portable. |
| Outside services | Content sources, the language model, and speech. All swappable. | Open content APIs (Met, AIC, Gutenberg, LibriVox, NASA, PhET). A model adapter so families can use Claude, GPT or a local Ollama model. Whisper for speech-to-text, Piper or Kokoro for read-aloud. |

## Decisions that shape everything else

- **Local-first or hosted.** A family can run the whole thing on a home server or a small computer like a Raspberry Pi, with only model calls leaving the house. A hosted version is easier for most families but makes the project responsible for children's data. The design should allow both, starting local-first.
- **Cost of model calls.** The weekly curation job and the tutoring sessions are the main costs. Pre-generating cards once a week and caching them keeps it to a few dollars a month per family. Live sessions can run on a cheaper or local model.
- **Offline by default.** The wall should work with no internet. Cards, audio and images download once a week. The Ask box is the only live piece.
- **Children's privacy law.** Any hosted version must meet COPPA in the US and similar laws elsewhere. Local-first avoids most of this, which is another reason to start there.
- **Content pipeline and licensing.** Every item in the library carries its source and license, and is approved before a child can see it. CC0 and public-domain items with no model-tagged flag (nudity, violence, needs_review) are approved automatically; flagged items wait for a guardian (decided 13 Oct 2026).
- **Portability.** Standard formats (xAPI, H5P, a documented plan format) so a family can leave with their data, and so other tools can plug in.

## A minimal single-family stack

The full architecture above is the community vision. One family can start much smaller, on hosted services most developers already know. This is the stack the first family is building on.

| Piece | Minimal version | Replaces in the full architecture |
| --- | --- | --- |
| Kid and parent apps | One web app on Vercel (or Netlify, Cloudflare Pages). The tablet opens the kid view, parents open the settings view. | Separate kid and parent apps |
| API | Serverless API routes alongside the app | FastAPI services |
| Database, auth, files | Supabase: tables for profiles, values and blackballs, cards, activity and check results. Supabase Auth for guardians. Storage for images and audio. | Postgres, Keycloak, Kolibri, SQL LRS |
| Weekly curation job | A scheduled (cron) function: Vercel calls one route eight times on Sunday, and each call builds one day of next week, because a week does not fit a function and a day does (Hobby stops a function at 300 seconds; a day takes about 130). If a day ever takes over 240 seconds, the Pro plan (800 seconds), not a worker. Built 20 Oct 2026; see [Curation engine](04-curation-engine.md), "How the Sunday build is built". | Scheduled job in the core |
| Language model | A model provider API key (Anthropic, OpenAI or similar) | Model adapter |
| Policy check | A second model call that checks each card against the written values profile before it's saved | gpt-oss-safeguard, Llama Guard |
| Digest | A transactional email service (Resend or similar) | Digest service |
| Voice | Google Cloud behind one adapter: Chirp 3 HD reads every line the tutor says, Chirp 3 hears the child; never the browser's own speech engines (decided 22 Oct 2026; *How the tutor's voice and ears are built*, below) | Whisper, Piper |
| Car audio | An RSS file in storage. Any podcast app subscribes. | Same |
| Tablets | iPads in Guided Access, or Android tablets in FreeKiosk, pointed at the app URL | Same |
| Code | GitHub, deploying on push | Same |

**Left out for one family:** Kolibri, the xAPI log server, the knowledge-tracing libraries, Keycloak and local models. Database tables do the job for one household.

**Rough cost:** hosting on free or lowest tiers, plus model usage. About $5–20 a month, depending on how much kids use the Ask box.

**What version one actually uses.** Everything is TypeScript in one Next.js app at the repo root, not Python services. The code lives in `app/` (the `/kid` and `/parent` views and the server routes), `lib/` and `supabase/migrations/`, with `core/` (model adapter, prompts, curation) arriving in phase 3. The kid view holds no database key: an iPad is paired from `/parent` with a six-digit code and then sends a device cookie to the app's own server routes, which read today's passed cards and write that child's answers through `lib/wall.ts`, on the service role, scoped in code to the paired child (docs/04, *How the Wonder Wall is built*). Setup steps are in [`deploy/README.md`](../deploy/README.md). A family runs one Supabase project; the developer's laptop uses two, a test project by default and the live one only through scripts named `:live`.

The policy gate in version one is a second Anthropic call per card through the same adapter (`core/curation/gate.ts`, on `QUARK_MODEL_GATE`), not gpt-oss-safeguard or Llama Guard: the family's rulebook is its policy, `gate/safety-floor.md` its floor, and blackballs, never and too-young subjects are applied in code before the model reads a card (docs/04, "How the gate is built").

## How the tutor's voice and ears are built

Built 22 and 23 Oct 2026, the tutor's slice 1 (`docs/tutor-voice-slice.md`; report `docs/reports/2026-10-22-tutor-voice.md`), on `phase-4-wonder-wall`: proven on `quark-test` and on a real iPad as the invented child Bug, not yet released or on live. Decisions in docs/08, *The tutor's voice, both ways*.

- **One adapter.** `core/speech.ts` (server only, like `core/model.ts`): `say(text)` returns MP3 in the tutor's voice, `TUTOR_VOICE`, which is Chirp 3 HD `en-US-Chirp3-HD-Sulafat`; `hear(pcm)` returns the words in one 16 kHz mono clip, with Chirp 3 (`chirp_3`, region `us`, automatic punctuation). Google sits behind it in `core/speech/google.ts`: plain REST calls with a service account's token (`google-auth-library`), the key from `GOOGLE_CREDENTIALS_JSON` (the key's JSON, for Vercel) or `GOOGLE_APPLICATION_CREDENTIALS` (a path or the JSON, for the laptop). No browser code imports either, and nothing anywhere uses `speechSynthesis` or `SpeechRecognition` (`lib/kid-wiring.test.ts`).
- **The mouth: `GET /api/kid/say?line=<card id>.<part>`.** A line is named by its card and part (`read`, `question`, `hint.N`, `handoff`) or one of the wall's own sentences, never by free text. `lineText()` in `core/wall/speech.ts` gives its words only when the paired child can see it now: the card on that child's wall today, the layer reached, a hint once earned, the handoff once reached (rule 3); otherwise 404. `read` is the card as the page shows it, its text then its question; `read_aloud` is never said. `forVoice()` drops the comma inside a number (3,400 is sent as 3400, which Google otherwise reads as a pause). The words as sent are hashed, and the MP3 is kept at `speech/<voice>/<hash>.mp3` in the private `content` bucket: made by Google on the first tap, stored, and served after that; the route answers with a redirect to a one-hour signed link. "Read it to me" (`app/kid/read-aloud.tsx`) starts the `<audio>` element inside the tap, as iPad Safari requires, and a tap while it reads stops it; one line plays at a time.
- **The ears: `POST /api/kid/hear`.** Talk (`app/kid/card/[id]/talk.tsx`) is a hold-to-talk button under the answer box: the microphone opens on the press and closes on the release, the page turns what it heard into 16 kHz 16-bit PCM and sends it as one clip of at most 30 seconds, and the words come back into the box, where the child can fix them and sends them with "That's my answer". A clip under 0.3 seconds is not sent to Google ("Keep holding the button while you talk."), and a refused microphone says so. Nothing the child said is kept: not the clip, not the words, unless the child sends them as an answer.
- **What is recorded.** One `speech_runs` row each time Google is called (migration `20261022000000`): the family, `say` or `hear`, the voice or model, the characters or seconds, and the cost at list price. A stored line played again writes nothing. `/parent/models` shows the voice, the ears, Google's prices and free tier (`SPEECH_PRICES` in `core/prices.ts`, checked 22 Oct 2026 by search), and lines, clips and cost this month and since the start.
- **For testing.** `npm run dev:ipad` runs the dev server over HTTPS for a real iPad (Safari gives the microphone only to a secure page), with a certificate for the laptop's home address from a one-time authority whose key is deleted once it signs; the iPad installs it once from `http://<address>:3001`. `npm run speech:check -- "<line>" …` has Google say each line and Chirp 3 hear it back, keeping nothing; `npm run speech:line -- <card id> [part]` says one card's line through the wall's own code, as the child's paired iPad would, stores it and hears it back (`scripts/server-alias.mts` lets a script load the app's `@/` code). `npm run fixture -- speech`, `-- card <id>` and `-- numbers <week>` show the calls and lines stored, one card's shown and spoken words, and every number shape in a week's spoken words. All on test only.

## Suggested repo layout (for the full architecture)

```
quark/
  core/          # curation engine, tutor session, learner model, digest (Python)
  gate/          # values policy, safety floor, consent and audit
  wall/          # kid-facing web app
  parent/        # parent settings app and digest templates
  plan/          # the multi-year learning plan as data
  content/       # source adapters, allowlist, license metadata
  deploy/        # docker-compose for a home server; Raspberry Pi notes
  docs/          # this concept
```
