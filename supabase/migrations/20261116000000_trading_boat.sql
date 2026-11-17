-- Quark — phase 4, the trading boat, slice 1 (docs/trading-boat-slice.md; Brandon's go at stop 1, 16 Nov 2026). On
-- test only in this slice: the boat runs on the dev server against test and nowhere else, so nothing on live reads
-- these tables. Additive.
--
-- boat_games: one row a child, the game's state. No name and nothing about the family (rule 7): money, the boat's
--   room in crates, the cargo, the island he is on, the rumor he sailed on, and today: the game's day number, the
--   calendar day it started, and where he is in it (core/boat/game.ts, Today), as the server last saved it.
-- boat_turns: one row an answer, for the parents (/parent, the test view only): the day, the trade, what was asked
--   (a buy, a sale, the boat, the look back), the good, the count and price, the count's step, the total wanted, his
--   words, and what kind of answer it was; plus a row when he lands (his money at the start of the day) and when he
--   casts off (the rumor he sailed on, in answer: the island).
-- Any guardian of the family reads both; only the server (service role) writes, as for attempts.

create table boat_games (
  child_id    uuid primary key references children(id) on delete cascade,
  family_id   uuid not null references families(id) on delete cascade,
  money       int not null default 20 check (money >= 0),
  space       int not null default 10 check (space in (10, 20, 50, 100)),
  cargo       jsonb not null default '[]',
  island      text not null default 'home',
  sailing     jsonb,
  today       jsonb,
  updated_at  timestamptz not null default now()
);

create index on boat_games (family_id);

create table boat_turns (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  child_id    uuid not null references children(id) on delete cascade,
  day         int not null check (day >= 1),
  played_on   date not null,
  trade       int,
  kind        text not null check (kind in ('buy', 'sell', 'boat', 'back', 'land', 'sail')),
  island      text not null,
  good        text,
  count       int,
  price       int,
  step        int,
  expected    int,
  answer      text,
  verdict     text check (verdict in ('right', 'added', 'one_off', 'other', 'dont_know', 'questioned')),
  short       boolean not null default false,
  money       int not null,
  created_at  timestamptz not null default now()
);

create index on boat_turns (child_id, day, created_at);

alter table boat_games enable row level security;
alter table boat_turns enable row level security;
create policy family_read on boat_games for select using (family_id = current_family_id());
create policy family_read on boat_turns for select using (family_id = current_family_id());

grant select on boat_games, boat_turns to authenticated;
grant all on boat_games, boat_turns to service_role;
