import type { Crates as Pic } from "@/core/boat/game";
import styles from "../kid.module.css";

// Exactly what is in the sum (decided 10 Nov 2026: "a picture of exactly what is in the sum"): so many crates, each marked
// with its price, or so many hundred-dollar bills. Drawn by the program from the sum's own numbers, so the count is
// always exact; the crates the count has reached are lit.
//
// Every crate is the same size, however many there are: the drawing is always laid out five across, and "room" sets how
// many rows it keeps, so the dial can slide from nothing to its most without the page moving (Brandon at stop 2, 16 Nov
// 2026: "Dynamic sizing of the numbers causes the slider to jump down and up like crazy"). Nothing moves or makes a sound.

const PER_ROW = 5;

// now: during the count, the crates counted once this step is right; the ones the step asks about are marked.
// room: the most it may have to show; the drawing keeps that many rows whatever the count.
export function Crates({ pic, now = null, room }: { pic: Pic; now?: number | null; room?: number }) {
  const bill = pic.unit === "bill";
  const w = bill ? 150 : 112;
  const h = bill ? 72 : 96;
  const gap = 16;
  const rows = Math.max(1, Math.ceil(Math.max(pic.count, room ?? 0) / PER_ROW));
  const width = PER_ROW * (w + gap) + gap;
  const height = rows * (h + gap) + gap;
  const label = `${pic.count} ${bill ? "hundred-dollar bills" : pic.count === 1 ? "crate" : "crates"}, $${pic.price} each`;
  return (
    <svg className={styles.drawing} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      {Array.from({ length: pic.count }, (_, i) => {
        const x = gap + (i % PER_ROW) * (w + gap);
        const y = gap + Math.floor(i / PER_ROW) * (h + gap);
        const lit = i < pic.lit;
        const asked = !lit && now !== null && i < now;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} rx={bill ? 6 : 10} className={lit ? styles.crateLit : asked ? styles.crateNow : bill ? styles.bill : styles.crate} />
            {bill ? null : (
              <>
                <line x1={x + 8} y1={y + 20} x2={x + w - 8} y2={y + 20} className={styles.crateSlat} />
                <line x1={x + 8} y1={y + h - 20} x2={x + w - 8} y2={y + h - 20} className={styles.crateSlat} />
              </>
            )}
            <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle" className={styles.drawText}>
              ${pic.price}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
