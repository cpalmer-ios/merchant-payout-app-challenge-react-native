/**
 * Activity dates are rendered as `DD MM YYYY`, for example `23 01 2026`.
 * The device timezone is used so the day matches the merchant's local calendar.
 */
export function formatActivityDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day} ${month} ${year}`;
}
