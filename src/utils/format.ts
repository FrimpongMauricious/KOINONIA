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
const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w`;
  const d = new Date(isoDate);
  return `${MONTH_ABBR[d.getMonth()]} ${d.getDate()}`;
}

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
