/**
 * Format a count into a compact display string.
 *   0–999       → "0", "42", "999"
 *   1000–999999 → "1K", "42.5K", "999K" (one decimal place if non-zero)
 *   1M–999M     → "1M", "42.5M"
 *   1B+         → "1B", "42.5B"
 *
 * Negative numbers and non-finite numbers return "0".
 * Always returns a string.
 */
export function formatCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0";
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    return k >= 100
      ? `${Math.floor(k)}K`
      : `${k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  if (n < 1_000_000_000) {
    const m = n / 1_000_000;
    return m >= 100
      ? `${Math.floor(m)}M`
      : `${m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  const b = n / 1_000_000_000;
  return b >= 100
    ? `${Math.floor(b)}B`
    : `${b.toFixed(1).replace(/\.0$/, "")}B`;
}
