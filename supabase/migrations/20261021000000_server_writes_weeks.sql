-- Quark — phase 4, slice 1: only the server writes a week, its verdicts, a child's answers and the audit
-- log (docs/04, "How a week goes live"; decided 20 Oct 2026). A signed-in guardian could write these
-- through the Data API (20261010000002), so the Looks-good tap's checks could be gone around and a card
-- one guardian's blackball held back could be marked passed by the other (rules 2 and 5). Guardians keep
-- reading all of it; the service role keeps writing it.
--
-- Wider than the 20 Oct decision's words in two places (docs/wonder-wall-1-slice.md, decision 4): insert
-- as well as update on the four week tables, since a guardian could otherwise insert a passed card into a
-- live week; and sessions and attempts, which the wall writes through the server from this slice on.
-- The /parent audit writes that went through the guardian's own session go through lib/audit.ts.
revoke insert, update on themes, ideas, cards, questions from authenticated;
revoke insert, update on sessions, attempts from authenticated;
revoke insert on audit_log from authenticated;
