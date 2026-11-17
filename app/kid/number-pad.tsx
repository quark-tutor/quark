"use client";

import { SAY } from "@/core/wall/words";
import styles from "./kid.module.css";

// The number pad under an answer box: three keys across, as on a phone (1 2 3 / 4 5 6 / 7 8 9 / 0 and Delete). Kept from
// the Math tile for the trading boat (docs/trading-boat-slice.md, The clean-up); its sums are answered with it, by
// typing, or by Talk. It only writes into the box; the box's own value is the answer.

const PAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function NumberPad({ onChange, disabled }: { onChange: (edit: (value: string) => string) => void; disabled?: boolean }) {
  const add = (d: string) => () => onChange((v) => `${v}${d}`.slice(0, 12));
  return (
    <div className={styles.numberPad}>
      {PAD.map((d) => (
        <button key={d} type="button" className={styles.key} disabled={disabled} onClick={add(d)}>
          {d}
        </button>
      ))}
      <button type="button" className={`${styles.key} ${styles.zeroKey}`} disabled={disabled} onClick={add("0")}>
        0
      </button>
      <button type="button" className={styles.keySmall} disabled={disabled} onClick={() => onChange((v) => v.slice(0, -1))}>
        {SAY.deleteDigit}
      </button>
    </div>
  );
}
