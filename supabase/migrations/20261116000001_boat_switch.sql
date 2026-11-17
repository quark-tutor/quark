-- Quark — phase 4, the trading boat, slice 2 (docs/trading-boat-2-slice.md). Additive: the code on live before this
-- slice's release never reads it.
--
-- families.boat_on: the family's switch for the trading boat. Off unless a guardian turns it on at /parent; any
--   guardian turns it on or off (rule 2), written by the server with an audit_log row. While it is on and the
--   family's times tables give the boat its prices, the wall's Math tile, The trading boat, takes Puzzle's place in
--   the day's order and Puzzle's tile is not shown. Off, the wall is as it was, Puzzle in its place. The tables
--   themselves are each child's mastery.place rows on the times-table rungs, set the same for every child.

alter table families
  add column boat_on boolean not null default false;
