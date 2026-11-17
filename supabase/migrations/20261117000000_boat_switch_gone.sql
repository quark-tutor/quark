-- The trading boat's switch is gone (docs/trading-boat-2-slice.md, stop 2's fix round). Brandon, 17 Nov 2026: "we
-- need to have code undo the switch, and release the math trading game in place of the puzzle, that was the
-- decision." The boat is on the wall for a child whenever the family's times tables give it prices (lib/boat-here.ts),
-- set on /parent or by the boat:tables command; with no table set the wall shows Puzzle. No code reads boat_on any
-- more. 20261116000001 added the column and is already on test, so it stays, and this one takes the column away; on
-- live the two run together at the same push and leave families as it was.
alter table families drop column boat_on;
