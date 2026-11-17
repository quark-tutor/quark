"use client";

import { SAY } from "@/core/wall/words";
import styles from "./kid.module.css";

// The number pad under an answer box: ten digits and Delete, the keys of the pairing page, a row of the box's width.
// Kept from the Math tile (docs/trading-boat-slice.md, The clean-up): the trading boat's sums are answered with it, by
// typing, or by Talk. It only writes into the box; the box's own value is the answer.

const PAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export function NumberPad({ onChange, disabled }: { onChange: (edit: (value: string) => string) => void; disabled?: boolean }) {
  return (
    <div className={styles.numberPad}>
      {PAD.map((d) => (
        <button key={d} type="button" className={styles.key} disabled={disabled} onClick={() => onChange((v) => `${v}${d}`.slice(0, 12))}>
          {d}
        </button>
      ))}
      <button type="button" className={styles.keySmall} disabled={disabled} onClick={() => onChange((v) => v.slice(0, -1))}>
        {SAY.deleteDigit}
      </button>
    </div>
  );
}
