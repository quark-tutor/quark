import type { Picture } from "@/core/math/problem";
import styles from "./kid.module.css";

// A picture drawn from its numbers (docs/math-tile-slice.md, decided at stop 1): no library picture for math in this
// slice, and a drawn one cannot carry a wrong number, since its numbers are the ones checkMath() held to the sum.
//   groups: so many plates with so many dots on each   blocks: hundreds, tens and ones for each number added
//   clock:  the minutes of an hour, shaded              graph: a bar for each number, with its name
// Plain SVG in the page's own colours; no picture moves or makes a sound (rule 4).

const W = 640;

export function MathPicture({ picture }: { picture: Picture }) {
  if (picture.kind === "groups") return <Groups n={picture.numbers[0]} each={picture.numbers[1]} labels={picture.labels} />;
  if (picture.kind === "blocks") return <Blocks numbers={picture.numbers} />;
  if (picture.kind === "clock") return <Clock minutes={picture.numbers[0]} />;
  if (picture.kind === "graph") return <Graph numbers={picture.numbers} labels={picture.labels} />;
  return null;
}

function Groups({ n, each, labels }: { n: number; each: number; labels: string[] }) {
  const perRow = Math.min(n, 4);
  const rows = Math.ceil(n / perRow);
  const r = 64;
  const gap = 24;
  const width = perRow * (2 * r + gap);
  const height = rows * (2 * r + gap) + 36;
  const dot = each <= 4 ? 12 : each <= 9 ? 9 : 7;
  const dots = (cx: number, cy: number) => {
    const cols = Math.ceil(Math.sqrt(each));
    const lines = Math.ceil(each / cols);
    const step = dot * 2.6;
    return Array.from({ length: each }, (_, i) => {
      const c = i % cols;
      const l = Math.floor(i / cols);
      return <circle key={i} cx={cx + (c - (cols - 1) / 2) * step} cy={cy + (l - (lines - 1) / 2) * step} r={dot} className={styles.drawDot} />;
    });
  };
  const label = `${n} ${labels[0] || "groups"}, ${each} ${labels[1] || ""} in each`.replace(/\s+/g, " ").trim();
  return (
    <svg className={styles.drawing} viewBox={`0 0 ${Math.max(width, 200)} ${height}`} role="img" aria-label={label}>
      {Array.from({ length: n }, (_, i) => {
        const cx = (i % perRow) * (2 * r + gap) + r + gap / 2;
        const cy = Math.floor(i / perRow) * (2 * r + gap) + r + gap / 2;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} className={styles.drawPlate} />
            {dots(cx, cy)}
          </g>
        );
      })}
      <text x={Math.max(width, 200) / 2} y={height - 8} textAnchor="middle" className={styles.drawText}>
        {label}
      </text>
    </svg>
  );
}

function Blocks({ numbers }: { numbers: number[] }) {
  const unit = 8;
  const parts = numbers.map((v) => ({ v, h: Math.floor(v / 100), t: Math.floor((v % 100) / 10), o: v % 10 }));
  const widthOf = (p: (typeof parts)[number]) => p.h * (10 * unit + 6) + p.t * (unit + 6) + Math.ceil(p.o / 5) * (unit + 6) + 12;
  const total = parts.reduce((w, p) => w + widthOf(p), 0) + (parts.length - 1) * 40;
  let x = 0;
  const height = 10 * unit + 64;
  return (
    <svg className={styles.drawing} viewBox={`0 0 ${Math.max(total, 200)} ${height}`} role="img" aria-label={numbers.map((v) => `${v}`).join(" and ") + " in hundreds, tens and ones"}>
      {parts.map((p, i) => {
        const start = x;
        const g = (
          <g key={i}>
            {Array.from({ length: p.h }, (_, k) => (
              <rect key={`h${k}`} x={start + k * (10 * unit + 6)} y={8} width={10 * unit} height={10 * unit} className={styles.drawHundred} />
            ))}
            {Array.from({ length: p.t }, (_, k) => (
              <rect key={`t${k}`} x={start + p.h * (10 * unit + 6) + k * (unit + 6)} y={8} width={unit} height={10 * unit} className={styles.drawTen} />
            ))}
            {Array.from({ length: p.o }, (_, k) => (
              <rect key={`o${k}`} x={start + p.h * (10 * unit + 6) + p.t * (unit + 6) + Math.floor(k / 5) * (unit + 6)} y={8 + (k % 5) * (unit + 4)} width={unit} height={unit} className={styles.drawOne} />
            ))}
            <text x={start + widthOf(p) / 2} y={height - 16} textAnchor="middle" className={styles.drawText}>
              {p.v}
            </text>
          </g>
        );
        x += widthOf(p);
        const plus =
          i < parts.length - 1 ? (
            <text key={`p${i}`} x={x + 14} y={10 * unit / 2 + 18} className={styles.drawText}>
              +
            </text>
          ) : null;
        x += i < parts.length - 1 ? 40 : 0;
        return [g, plus];
      })}
    </svg>
  );
}

function Clock({ minutes }: { minutes: number }) {
  const r = 120;
  const c = 140;
  const m = Math.max(0, Math.min(60, minutes));
  const end = (m / 60) * 2 * Math.PI;
  const px = c + r * Math.sin(end);
  const py = c - r * Math.cos(end);
  const wedge = m >= 60 ? <circle cx={c} cy={c} r={r} className={styles.drawShade} /> : m > 0 ? <path d={`M ${c} ${c} L ${c} ${c - r} A ${r} ${r} 0 ${m > 30 ? 1 : 0} 1 ${px} ${py} Z`} className={styles.drawShade} /> : null;
  return (
    <svg className={styles.drawing} viewBox="0 0 280 320" role="img" aria-label={`A clock with ${m} of its 60 minutes shaded`}>
      <circle cx={c} cy={c} r={r} className={styles.drawPlate} />
      {wedge}
      {Array.from({ length: 12 }, (_, k) => {
        const a = (k / 12) * 2 * Math.PI;
        return <line key={k} x1={c + (r - 14) * Math.sin(a)} y1={c - (r - 14) * Math.cos(a)} x2={c + r * Math.sin(a)} y2={c - r * Math.cos(a)} className={styles.drawTick} />;
      })}
      <text x={c} y={310} textAnchor="middle" className={styles.drawText}>
        {m} minutes
      </text>
    </svg>
  );
}

function Graph({ numbers, labels }: { numbers: number[]; labels: string[] }) {
  const top = Math.max(...numbers, 1);
  const barW = 72;
  const gap = 36;
  const plot = 240;
  const width = numbers.length * (barW + gap) + gap;
  return (
    <svg className={styles.drawing} viewBox={`0 0 ${width} ${plot + 90}`} role="img" aria-label={`A bar graph: ${labels.map((l, i) => `${l} ${numbers[i]}`).join(", ")}`}>
      <line x1={gap / 2} y1={plot + 10} x2={width - gap / 2} y2={plot + 10} className={styles.drawTick} />
      {numbers.map((v, i) => {
        const h = (v / top) * plot;
        const x = gap + i * (barW + gap);
        return (
          <g key={i}>
            <rect x={x} y={plot + 10 - h} width={barW} height={h} className={styles.drawBar} />
            <text x={x + barW / 2} y={plot - h} textAnchor="middle" className={styles.drawText}>
              {v}
            </text>
            <text x={x + barW / 2} y={plot + 40} textAnchor="middle" className={styles.drawLabel}>
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
