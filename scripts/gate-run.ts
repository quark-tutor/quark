// The gate's part of the report, for the terminal, shared by scripts/gate.mts and scripts/week-build.mts.
// The gate itself against the database is core/curation/gate-run.ts, which the Sunday route uses too.

import type { GateReport } from "../core/curation/gate.ts";
import type { GateSetup } from "../core/curation/gate-run.ts";

// Names a child only by nickname, as the rest of the week report does; nothing here is stored.
export function printGate(report: GateReport, setup: GateSetup) {
  const nick = new Map(setup.children.map((k) => [k.id, k.nickname]));
  const floor = `safety floor v${setup.floor.version}${setup.floor.firstGuess ? ", a first guess" : ""}`;
  console.log(`\nThe gate (${setup.rulebook ? `rulebook ${setup.rulebook.hash.slice(0, 8)}` : "no rulebook"}, ${floor}; on ${setup.model}):`);
  console.log(
    `  ${report.cards} cards. ${report.passed} passed, ${report.blockedByCode} held back in code by the family's settings, ${report.blockedByModel} held back by the checker, ${report.pending} left pending.`,
  );
  console.log(`  Left as they were: ${report.upToDate} already checked against this rulebook, ${report.heldBackByChecks} held back by the card checks.`);
  if (report.staleLeft) console.log(`  Left alone, checked against another rulebook or floor: ${report.staleLeft}.`);
  if (setup.documentChars !== null) console.log(`  The gate's copy of the rulebook: ${setup.documentChars.toLocaleString()} characters.`);
  if (report.pending) {
    console.log("  Left pending, so the command ends with an error:");
    for (const [why, n] of Object.entries(report.faults)) console.log(`    ${why} (${n})`);
  }
  if (report.heldBack.length) {
    const byRule = Object.entries(report.reasons).sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r} ${n}`).join(", ");
    console.log(`  Held back, by rule: ${byRule}.`);
    for (const h of report.heldBack) {
      console.log(`    ${nick.get(h.childId) ?? "?"}: ${h.label} (${h.by}): ${h.reasons.map((r) => r.note).join(" ")}`);
    }
  }
  if (report.readerNotes.length) {
    console.log(`  Reader notes (they never change a verdict): ${report.readerNotes.length} cards.`);
    for (const r of report.readerNotes) console.log(`    ${nick.get(r.childId) ?? "?"}: ${r.label}: ${r.notes.join(" ")}`);
  }
}
