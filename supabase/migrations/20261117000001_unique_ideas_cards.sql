-- Quark: a day cannot be written twice (docs/unique-indexes-slice.md; docs/04, "How the Sunday build is
-- built", The lock). The database itself refuses a second copy of an idea or of a card. The Sunday build's
-- lock, buildWeek's refusal of a day that has ideas, and --rebuild stay as they are, in front of it.
--
-- 1. ideas: one row for a theme, day, slot and layer. An idea whose day is null (the column came on
--    14 Oct 2026 and allows it) is not covered: nulls are distinct, so such rows never meet.
-- 2. cards: one row for an idea and a child. The idea comes first, so this index also serves every read
--    by idea alone (a day's ideas deleted take their cards with them).
-- 3. The two plain indexes the new ones make redundant are dropped: ideas (theme_id, day, slot, layer)
--    from 20261014000000, and cards (idea_id) from 20261010000000. cards (child_id, day, slot, layer),
--    which the wall reads by, stays.
--
-- A create that meets a double fails. The CLI sends the file's statements and its history row as one
-- batch, which Postgres runs as one transaction, so a failure changes nothing.

create unique index ideas_theme_day_slot_layer on ideas (theme_id, day, slot, layer);
create unique index cards_idea_child on cards (idea_id, child_id);

drop index ideas_theme_id_day_slot_layer_idx;
drop index cards_idea_id_idx;
