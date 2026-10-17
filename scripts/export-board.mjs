// Writes "Quark board.html": the state board (docs/board.md), any side projects
// (docs/side/*.md) and the bug counts (the Bugs list in docs/08-open-questions.md)
// as one self-contained page, for reading at the computer. No script, no network,
// no font or image: it opens by double-click in any browser and looks the same
// tomorrow. Cards fold with the browser's own <details> element.
//
// The repository is where the board is kept; the page is a copy, rewritten by
// `npm run docs:board` at the end of every job and not tracked. Nobody should edit it.
//
// Usage:
//   npm run docs:board                 (writes to the repository root)
//   npm run docs:board -- "C:\some\other\folder"
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const outDir = process.argv[2] ?? root;
if (!existsSync(outDir)) {
  console.error(`That folder doesn't exist: ${outDir}`);
  console.error('Pass the folder to write to: npm run docs:board -- "C:\\path\\to\\folder"');
  process.exit(2);
}

// A link to a file in docs/ only works when the page sits inside the repository.
const linkable = !path.relative(root, path.resolve(outDir)).startsWith("..");

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const plain = (s) => s.replace(/`/g, "").replace(/\*([^*]+)\*/g, "$1").trim();

// Rows of the first table in a markdown file, as arrays of trimmed cells.
function tableRows(file) {
  const rows = [];
  for (const line of readFileSync(path.join(root, file), "utf8").split(/\r?\n/)) {
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
    rows.push(cells);
  }
  return rows.slice(1); // the header row
}

const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
function parseDay(text) {
  const m = /(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})/.exec(text);
  return m ? Date.UTC(Number(m[3]), MONTHS[m[2]], Number(m[1])) : null;
}

const now = new Date();
const hawaii = (opts) => now.toLocaleString("en-US", { timeZone: "Pacific/Honolulu", ...opts });
const todayParts = hawaii({ year: "numeric", month: "numeric", day: "numeric" }).split("/");
const today = Date.UTC(Number(todayParts[2]), Number(todayParts[0]) - 1, Number(todayParts[1]));
const ageOf = (at) => (at === null ? null : Math.round((today - at) / 86400000));

let commit = "unknown";
let branch = "unknown";
try {
  commit = execSync("git rev-parse --short HEAD", { cwd: root, encoding: "utf8" }).trim();
  branch = execSync("git branch --show-current", { cwd: root, encoding: "utf8" }).trim() || "detached";
} catch {
  // The page still works without them.
}

const board = tableRows("docs/board.md").map(([feature, stage, moved, waiting, size, importance, phase, where]) => {
  const [mine, june] = importance.split("/").map((p) => p.trim());
  return { feature, stage, moved, waiting, size, mine, june, phase, where, days: ageOf(parseDay(moved)) };
});

const RANK = { high: 0, medium: 1, low: 2 };
const byImportance = (a, b) => (RANK[a.mine] ?? 3) - (RANK[b.mine] ?? 3);

// The day a Waiting on names, if it names one ("31 Dec 2026", or "20 Oct" in this year): soonest first.
function dueDay(text) {
  const full = parseDay(text);
  if (full !== null) return full;
  const m = /(\d{1,2}) ([A-Z][a-z]{2})\b/.exec(text);
  return m && m[2] in MONTHS ? Date.UTC(Number(todayParts[2]), MONTHS[m[2]], Number(m[1])) : Infinity;
}
const bySoonest = (a, b) => dueDay(a.waiting) - dueDay(b.waiting) || byImportance(a, b);

function linkify(text) {
  const out = esc(text);
  return linkable ? out.replace(/docs\/[\w./-]+\.md/g, (p) => `<a href="${p}">${p}</a>`) : out;
}

const STAGE_CLASS = {
  building: "building",
  "on test": "ontest",
  "on hold": "onhold",
  briefed: "briefed",
  raised: "raised",
  "not fully formed": "nff",
  live: "live",
  "not doing": "notdoing",
};

// A card is one line closed (name, what it waits on, then age, size, importance, phase in small
// type) and opens to add Where and the whole of Waiting on. A seeded row has no real movement
// date yet, so it shows "seeded", not a day count.
const mark = (importance) => `<span class="imp ${RANK[importance] === undefined ? "none" : importance}" title="${importance && importance !== "—" ? `importance: ${esc(importance)}` : "not rated"}"></span>`;

function card(r, open = false) {
  const waiting = r.waiting && r.waiting !== "—" ? esc(plain(r.waiting)) : "";
  const small = [];
  if (/seeded/.test(r.moved)) small.push(`seeded ${esc(r.moved.replace(/ \d{4}.*/, ""))}`);
  else if (r.days !== null) small.push(r.days === 0 ? "today" : `${r.days}d`);
  if (r.size && r.size !== "—") small.push(esc(r.size));
  if (r.mine && r.mine !== "—") small.push(`${esc(r.mine)}${r.june && r.june !== "—" ? ` (June ${esc(r.june)})` : ""}`);
  if (r.phase && r.phase !== "—") small.push(/^\d$/.test(r.phase) ? `phase ${esc(r.phase)}` : esc(plain(r.phase)));
  const detail = [];
  if (waiting) detail.push(`<div><b>Waiting on</b> ${waiting}</div>`);
  if (r.where) detail.push(`<div><b>Where</b> ${linkify(plain(r.where))}</div>`);
  return `<li><details class="card ${STAGE_CLASS[r.stage] ?? ""}"${open ? " open" : ""}><summary>${mark(r.mine)}<span class="name">${esc(plain(r.feature))}</span><span class="wait">${waiting}</span><span class="small">${small.join(" · ")}</span></summary><div class="more">${detail.join("")}</div></details></li>`;
}

const section = (title, rows, { sort = byImportance, open = false } = {}) =>
  `<section class="panel"><h2>${title} <span class="count">${rows.length}</span></h2>${
    rows.length ? `<ul>${[...rows].sort(sort).map((r) => card(r, open)).join("\n")}</ul>` : `<p class="none">Nothing</p>`
  }</section>`;

const folded = (title, rows) =>
  `<details class="panel fold"><summary><h2>${title} <span class="count">${rows.length}</span></h2></summary>${
    rows.length ? `<ul>${[...rows].sort(byImportance).map((r) => card(r)).join("\n")}</ul>` : `<p class="none">Nothing</p>`
  }</details>`;

const stage = (...names) => board.filter((r) => names.includes(r.stage));
const live = board.filter((r) => r.stage === "live" && (r.days === null || r.days <= 14));
const notDoing = stage("not doing");

// Side projects: one per docs/side/<name>.md. Its first line is the first paragraph of *Where we
// stopped*; its Summary block (a fixed shape, rewritten by /close inside the side project) shows
// whole when the card opens. The dates and count are git's, for the whole of branch side/<name>;
// with no such branch the file's own commits stand in.
function gitLines(args) {
  try {
    return execSync(`git log --format=%cs ${args}`, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .trim()
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    return [];
  }
}
function sideProjects() {
  const dir = path.join(root, "docs", "side");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const name = f.replace(/\.md$/, "");
      const text = readFileSync(path.join(dir, f), "utf8");
      const m = /^##\s+Where we stopped\s*\r?\n+([\s\S]*?)(?:\r?\n\s*\r?\n|\r?\n##\s|$)/m.exec(text);
      const stopped = m ? plain(m[1].replace(/\s*\r?\n\s*/g, " ")) : "";
      const first = (/^.*?[.!?](?=\s|$)/.exec(stopped) ?? [stopped])[0];
      const s = /^##\s+Summary\s*\r?\n([\s\S]*?)(?=\r?\n##\s|(?![\s\S]))/m.exec(text);
      let days = gitLines(`side/${name}`);
      if (!days.length) days = gitLines(`-- docs/side/${f}`);
      const lastDay = days[0] ?? "";
      const at = lastDay ? Date.parse(`${lastDay}T00:00:00Z`) : null;
      return { name, stopped, first, summary: s ? s[1].trim() : "", age: ageOf(at), firstDay: days[days.length - 1] ?? "", lastDay, commits: days.length };
    });
}
const sides = sideProjects();

// The Summary block: "**Label:** text" lines, and "- " bullets under the label before them.
function summaryHtml(block) {
  const out = [];
  let list = false;
  const inline = (s) => esc(plain(s));
  for (const line of block.split(/\r?\n/)) {
    const bullet = /^\s*- /.test(line);
    if (list && !bullet) {
      out.push("</ul>");
      list = false;
    }
    const label = /^\*\*([^*]+?):\*\*\s*(.*)$/.exec(line);
    if (label) out.push(`<div class="sumline"><b>${esc(label[1])}</b> ${inline(label[2])}</div>`);
    else if (bullet) {
      if (!list) {
        out.push('<ul class="sumlist">');
        list = true;
      }
      out.push(`<li>${inline(line.replace(/^\s*- /, ""))}</li>`);
    } else if (line.trim()) out.push(`<div class="sumline">${inline(line)}</div>`);
  }
  if (list) out.push("</ul>");
  return out.join("");
}

const shortDay = (iso) => {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${Object.keys(MONTHS)[m - 1]}`;
};

const sideCard = (s) => {
  const dates = s.commits ? `${shortDay(s.firstDay)} – ${shortDay(s.lastDay)} · ${s.commits} commit${s.commits === 1 ? "" : "s"}` : "no commits yet";
  return `<li><details class="card side"><summary><span class="imp none"></span><span class="name">${esc(s.name)}</span><span class="wait">${esc(s.first)}</span><span class="small">${
    s.age === null ? "no commit yet" : s.age === 0 ? "today" : `${s.age}d`
  } · ${dates}</span></summary><div class="more">${s.summary ? summaryHtml(s.summary) : ""}<div><b>Where we stopped</b> ${esc(s.stopped)}</div><div><b>Git</b> ${dates}</div><div><b>Where</b> ${linkify(`docs/side/${s.name}.md`)}</div></div></details></li>`;
};

// Bugs: bullet lines under "## Bugs" in docs/08. Group = the first "phase N" in the line, or
// "tooling", else "Other"; the oldest date is the line's leading date.
const bugText = readFileSync(path.join(root, "docs/08-open-questions.md"), "utf8");
const bugSection = /^##\s+Bugs\s*\r?\n([\s\S]*?)(?=\r?\n##\s|(?![\s\S]))/m.exec(bugText);
const bugs = new Map();
for (const line of (bugSection ? bugSection[1] : "").split(/\r?\n/).filter((l) => l.startsWith("- "))) {
  const date = /^- (\d{1,2} [A-Z][a-z]{2} \d{4})/.exec(line)?.[1] ?? "";
  const ph = /\bphase (\d)\b/i.exec(line);
  const key = ph ? `phase ${ph[1]}` : /\btooling\b/i.test(line) ? "tooling" : "Other";
  const at = parseDay(date);
  const entry = bugs.get(key) ?? { count: 0, oldest: null, oldestText: "" };
  entry.count += 1;
  if (at !== null && (entry.oldest === null || at < entry.oldest)) {
    entry.oldest = at;
    entry.oldestText = date;
  }
  bugs.set(key, entry);
}
const bugRows = [...bugs.entries()].sort((a, b) => b[1].count - a[1].count);
const bugTotal = bugRows.reduce((n, [, b]) => n + b.count, 0);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Quark board</title>
<style>
  :root { --text:#242424; --muted:#616161; --line:#E3E3E3; --link:#00666A; --bar:#141414; --bar-text:#E6E6E6; --soft:#F5F5F5;
    --building:#008287; --ontest:#003287; --onhold:#8A6100; --briefed:#4CC2C6; --raised:#616161; --nff:#B0B0B0; --live:#107C10; --notdoing:#8A1F1D; }
  * { box-sizing: border-box; }
  body { margin:0; background:#FFFFFF; color:var(--text); font:14px/1.4 "Segoe UI", system-ui, -apple-system, sans-serif; }
  header { background:var(--bar); color:var(--bar-text); padding:8px 16px; display:flex; flex-wrap:wrap; gap:2px 16px; align-items:baseline; }
  header h1 { margin:0; font-size:18px; font-weight:600; }
  header .stamp { font-size:12px; color:#D0D0D0; }
  header .how { flex-basis:100%; }
  header a { color:#4CC2C6; }
  main { padding:10px 16px 16px; }
  h2 { font-size:14px; font-weight:600; margin:0 0 6px; }
  .count { color:var(--muted); font-weight:400; }
  .top { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:10px; align-items:start; }
  .top.two { grid-template-columns:repeat(2, minmax(0, 1fr)); }
  .stack { display:grid; gap:10px; }
  .pair, .bands { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:10px; margin-top:10px; align-items:start; }
  .bands { grid-template-columns:repeat(3, minmax(0, 1fr)); }
  .panel, .stack, li, .card { min-width:0; }
  .panel { border:1px solid var(--line); border-radius:4px; padding:8px 10px; overflow:hidden; }
  .fold > summary { cursor:pointer; list-style:none; }
  .fold > summary h2 { margin:0; }
  .fold > summary h2::before { content:"▸ "; color:var(--muted); }
  .fold[open] > summary h2::before { content:"▾ "; }
  .fold[open] > summary h2 { margin-bottom:6px; }
  ul { list-style:none; margin:0; padding:0; display:grid; gap:3px; }
  .card { border:1px solid var(--line); border-left:4px solid var(--raised); border-radius:4px; background:#FFFFFF; }
  .card summary { display:flex; align-items:baseline; gap:6px; padding:2px 7px; cursor:pointer; list-style:none; white-space:nowrap; overflow:hidden; }
  .card summary::-webkit-details-marker { display:none; }
  .card .name { font-weight:600; flex:0 1 auto; overflow:hidden; text-overflow:ellipsis; }
  .card .wait { flex:1 1 0; min-width:0; overflow:hidden; text-overflow:ellipsis; }
  .card .small { flex:0 0 auto; font-size:12px; color:var(--muted); }
  .card[open] summary { white-space:normal; flex-wrap:wrap; }
  .card[open] .wait { flex-basis:100%; overflow:visible; }
  .more { padding:0 7px 4px 24px; font-size:12px; color:var(--muted); }
  .more b { color:var(--text); font-weight:600; }
  .sumline { margin-bottom:3px; }
  .sumlist { margin:0 0 3px; padding-left:18px; list-style:disc; display:block; }
  .sumline { margin-bottom:3px; }
  .sumlist { margin:0 0 3px; padding-left:18px; list-style:disc; display:block; }
  .building { border-left-color:var(--building); } .ontest { border-left-color:var(--ontest); } .onhold { border-left-color:var(--onhold); }
  .briefed { border-left-color:var(--briefed); } .raised { border-left-color:var(--raised); } .nff { border-left-color:var(--nff); }
  .live { border-left-color:var(--live); } .notdoing { border-left-color:var(--notdoing); } .side { border-left-color:var(--building); }
  .imp { flex:0 0 auto; width:9px; height:9px; border-radius:50%; border:1px solid var(--text); align-self:center; }
  .imp.high { background:var(--text); } .imp.medium { background:linear-gradient(90deg, var(--text) 50%, transparent 50%); }
  .imp.low { background:transparent; } .imp.none { border-color:transparent; }
  a { color:var(--link); }
  .none { color:var(--muted); margin:0; }
  .bands ul { gap:0; }
  .bands li { display:flex; gap:8px; justify-content:space-between; border-bottom:1px solid #F0F0F0; padding:2px 0; }
  .bands li:last-child { border-bottom:0; }
  .bands .note { color:var(--muted); text-align:right; }
  table { border-collapse:collapse; width:100%; }
  th { text-align:left; font-size:12px; font-weight:600; color:var(--muted); border-bottom:1px solid #E0E0E0; padding:2px 8px 2px 0; }
  td { border-bottom:1px solid #F0F0F0; padding:2px 8px 2px 0; }
  td.num, th.num { text-align:right; }
  @media (max-width: 1100px) { .top, .bands { grid-template-columns:repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 700px) { .top, .bands, .pair { grid-template-columns:1fr; } main { padding:8px; } }
</style>
</head>
<body>
<header>
  <h1>Quark board</h1>
  <span class="stamp">Written ${esc(hawaii({ weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }))} Hawaii time · branch ${esc(branch)} · commit ${esc(commit)} · ${board.length} rows · a copy: the board is kept in the repository, in ${linkable ? `<a href="docs/board.md">docs/board.md</a>` : "docs/board.md"}</span>
  <span class="stamp how">Add: /idea in Claude Code. Moves: /close moves what a job touched; for anything else, tell Claude Code or the chat in a sentence.</span>
</header>
<main>
<div class="top${sides.length ? "" : " two"}">
<div class="stack">
${section("In hand", stage("building"), { open: true })}
${section("Next", stage("briefed"))}
</div>
${section("Waiting", stage("on test", "on hold"), { sort: bySoonest })}
${
  sides.length
    ? `<section class="panel"><h2>Side projects <span class="count">${sides.length}</span></h2><ul>${sides.map(sideCard).join("\n")}</ul></section>`
    : ""
}
</div>
<div class="pair">
${folded("Raised", stage("raised"))}
${folded("Not fully formed", stage("not fully formed"))}
</div>
<div class="bands">
<section class="panel"><h2>Live lately <span class="count">${live.length}</span></h2>${
  live.length
    ? `<ul>${live.map((r) => `<li><span>${esc(plain(r.feature))}</span><span class="note">${esc(r.moved)}</span></li>`).join("")}</ul>`
    : `<p class="none">Nothing in the last 14 days</p>`
}</section>
<section class="panel"><h2>Not doing <span class="count">${notDoing.length}</span></h2>${
  notDoing.length
    ? `<ul>${notDoing.map((r) => `<li><span>${esc(plain(r.feature))}</span><span class="note">${esc(plain(r.waiting))}</span></li>`).join("")}</ul>`
    : `<p class="none">Nothing</p>`
}</section>
<section class="panel"><h2>Bugs <span class="count">${bugTotal} open</span></h2>${
  bugRows.length
    ? `<table><thead><tr><th>Phase</th><th class="num">Open</th><th>Oldest</th></tr></thead><tbody>${bugRows
        .map(([m, b]) => `<tr><td>${esc(m)}</td><td class="num">${b.count}</td><td>${esc(b.oldestText)}</td></tr>`)
        .join("")}</tbody></table>`
    : `<p class="none">None open</p>`
}</section>
</div>
</main>
</body>
</html>
`;

const target = path.join(outDir, "Quark board.html");
writeFileSync(target, html);
console.log(`Wrote ${target}`);
console.log(
  `In hand ${stage("building").length} · Waiting ${stage("on test", "on hold").length} · Next ${stage("briefed").length} · Side projects ${sides.length} · Raised ${stage("raised").length} · Not fully formed ${stage("not fully formed").length} · Live lately ${live.length} · Not doing ${notDoing.length} · Bugs ${bugTotal}`,
);
