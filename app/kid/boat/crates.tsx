import type { Crates as Pic } from "@/core/boat/game";
import styles from "../kid.module.css";

// Exactly what is in the sum (decided 10 Nov 2026: "a picture of exactly what is in the sum, and nothing else"): so
// many crates, each marked with its price, or so many hundred-dollar bills. Drawn by the program from the sum's own
// numbers, so the count is always exact; the crates the count has reached are lit. Nothing moves or makes a sound.
export function Crates({ pic }: { pic: Pic }) {
  const bill = pic.unit === "bill";
  const perRow = 5;
  const w = bill ? 150 : 112;
  const h = bill ? 72 : 96;
  const gap = 16;
  const rows = Math.ceil(pic.count / perRow);
  const cols = Math.min(pic.count, perRow);
  const width = cols * (w + gap) + gap;
  const height = rows * (h + gap) + gap;
  const label = `${pic.count} ${bill ? "hundred-dollar bills" : pic.count === 1 ? "crate" : "crates"}, $${pic.price} each`;
  return (
    <svg className={styles.drawing} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      {Array.from({ length: pic.count }, (_, i) => {
        const x = gap + (i % perRow) * (w + gap);
        const y = gap + Math.floor(i / perRow) * (h + gap);
        const lit = i < pic.lit;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} rx={bill ? 6 : 10} className={lit ? styles.crateLit : bill ? styles.bill : styles.crate} />
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
