const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatInr(amount: number): string {
  return inr.format(amount);
}

/** ISO date (YYYY-MM-DD) -> "15 Feb 2024" */
export function formatDate(iso: string): string {
  const d = new Date(`${iso.length === 10 ? `${iso}T00:00:00` : iso}`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** ISO timestamp -> "15 Feb 2024, 2:36 pm" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
