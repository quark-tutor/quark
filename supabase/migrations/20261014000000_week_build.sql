-- Quark — phase 3: ideas and cards for a week (docs/04, "How a week is built").
--
-- 1. ideas.day: an idea chain is written for one day and slot of the week, before any card exists.
-- 2. cards.door: the child's interest that opened a layer-1 card, if one did. Interests may open at
--    most a quarter of a week's layer-1 cards (docs/17), and the digest can say which ones did.

alter table ideas
  add column day int check (day between 1 and 7);

create index on ideas (theme_id, day, slot, layer);

alter table cards
  add column door text;
