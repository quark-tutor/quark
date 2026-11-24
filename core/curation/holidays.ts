// The days a lesson can be about, for the app's own writer (Brandon, 23 Nov 2026, at go: "Holidays are placed on their
// days, as decided 28 Oct; the writer is given next week's dates and holidays"). Pure: worked out from the date.
//
// - Holidays: the US federal holidays, and a few days every family keeps. A holiday's lesson goes on its own day,
//   on the first tile whose next open day it is; one a holiday. It is written only when it touches no values point,
//   like every lesson the app writes, so some holidays (Veterans Day, Christmas) may get none, and the run says so.
// - The Hawaiʻi days are not placed: the app writes no whole Hawaiʻi lesson (Brandon, 23 Nov 2026, at go). The writer
//   is told them, for a tie-in line inside another lesson where its reference supports one.

const fixed = (month: number, day: number) => (year: number) => iso(year, month, day);
// The nth weekday (0 Sunday … 6 Saturday) of a month; n = -1 for the last.
const nth = (month: number, weekday: number, n: number) => (year: number) => {
  if (n > 0) {
    const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    return iso(year, month, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7);
  }
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const last = new Date(Date.UTC(year, month - 1, lastDay)).getUTCDay();
  return iso(year, month, lastDay - ((last - weekday + 7) % 7));
};
const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export const HOLIDAYS: { name: string; on: (year: number) => string }[] = [
  { name: "New Year's Day", on: fixed(1, 1) },
  { name: "Martin Luther King Jr. Day", on: nth(1, 1, 3) },
  { name: "Groundhog Day", on: fixed(2, 2) },
  { name: "Valentine's Day", on: fixed(2, 14) },
  { name: "Presidents' Day (Washington's Birthday)", on: nth(2, 1, 3) },
  { name: "Pi Day", on: fixed(3, 14) },
  { name: "Earth Day", on: fixed(4, 22) },
  { name: "Memorial Day", on: nth(5, 1, -1) },
  { name: "Juneteenth", on: fixed(6, 19) },
  { name: "Independence Day", on: fixed(7, 4) },
  { name: "Labor Day", on: nth(9, 1, 1) },
  { name: "Columbus Day", on: nth(10, 1, 2) },
  { name: "Halloween", on: fixed(10, 31) },
  { name: "Veterans Day", on: fixed(11, 11) },
  { name: "Thanksgiving", on: nth(11, 4, 4) },
  { name: "Christmas Day", on: fixed(12, 25) },
  { name: "New Year's Eve", on: fixed(12, 31) },
];

export const HAWAII_DAYS: { name: string; on: (year: number) => string }[] = [
  { name: "Prince Kūhiō Day", on: fixed(3, 26) },
  { name: "Lei Day", on: fixed(5, 1) },
  { name: "Kamehameha Day", on: fixed(6, 11) },
  { name: "Statehood Day", on: nth(8, 5, 3) },
  { name: "Lā Kūʻokoʻa", on: fixed(11, 28) },
];

const on = (list: typeof HOLIDAYS, date: string) => list.filter((h) => h.on(Number(date.slice(0, 4))) === date).map((h) => h.name);

export const holidaysOn = (date: string): string[] => on(HOLIDAYS, date);
export const hawaiiDaysOn = (date: string): string[] => on(HAWAII_DAYS, date);
