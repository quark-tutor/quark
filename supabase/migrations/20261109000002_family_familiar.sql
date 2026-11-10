-- Quark — phase 4, the Math tile, slice 1, fix round 3 (docs/math-tile-slice.md; Brandon, 9 Nov 2026: the test is not
-- "has a child in Hawaiʻi seen this" but "have these children seen or done this"). Additive: the code on live before
-- the release never reads it, so this goes to live with 20261109000000 and 20261109000001, at stop M1.
--
-- families.familiar: a short list of places and things the family knows, in the guardians' own words. The math
--   prompt sets each day's problem in one of them or in one of the child's own interests, and the gate's not_here
--   rule holds back a math setting the children have not seen or done. Kept here with the family's settings, never in
--   the repository; set by a guardian's hand (stop M2 for the first family). Empty means no setting is assumed known
--   beyond everyday life and the children's interests.

alter table families
  add column familiar text[] not null default '{}';
