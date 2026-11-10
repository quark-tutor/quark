-- Quark — phase 4, the Math tile, slice 1, fix round 2 (docs/math-tile-slice.md; Brandon, 9 Nov 2026: "Say it as a
-- number." to a boy who said the problem could not be answered was "demeaning"). Additive: the code on live before the
-- release writes neither value, so this goes to live with 20261109000000, at stop M1.
--
-- attempts.verdict gains two values, both on a math part, for a reply with no number that the judge read first:
--   questioned  he said something is missing or wrong with the problem; shown to the parents with that day's problem
--   no_number   anything else with no number in it ("What number do you get?")
-- A reply the judge reads as "I don't know" writes nothing, as before ("Have a guess first.").

alter table attempts drop constraint attempts_verdict_check;
alter table attempts add constraint attempts_verdict_check
  check (verdict in ('right', 'close', 'hint', 'not_yet', 'not_a_guess', 'questioned', 'no_number'));
