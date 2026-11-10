import { addDays, todayIn } from "@/core/curation/week";
import type { Device } from "@/lib/device";
import { devDay, devFamily } from "@/lib/dev-view";
import styles from "./kid.module.css";

// The test view's bar at the foot of the wall (lib/dev-view.ts): the family's children, the one on this iPad
// marked, and the day the wall shows, with the day before, the day after, and today. Plain links to /kid/dev. On the
// dev server against test only; renders nothing anywhere else.
export async function DevBar({ device }: { device: Device }) {
  const family = await devFamily(device);
  if (!family) return null;
  const kids = family.children;
  const shown = (await devDay()) ?? todayIn(family.timezone);
  const label = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  return (
    <nav className={styles.devBar} aria-label="Test view">
      <span className={styles.devLabel}>Test view</span>
      {kids.map((k) => (
        <a key={k.id} href={`/kid/dev?child=${k.id}`} className={k.id === device.childId ? `${styles.devLink} ${styles.devOn}` : styles.devLink}>
          {k.nickname}
        </a>
      ))}
      <a href={`/kid/dev?day=${addDays(shown, -1)}`} className={styles.devLink}>
        ◀
      </a>
      <span className={styles.devLabel}>{label(shown)}</span>
      <a href={`/kid/dev?day=${addDays(shown, 1)}`} className={styles.devLink}>
        ▶
      </a>
      <a href="/kid/dev?day=today" className={styles.devLink}>
        Today
      </a>
    </nav>
  );
}
