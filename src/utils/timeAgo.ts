/**
 * Parses any backend date string or timestamp reliably.
 * Since backend MySQL timestamps are stored/returned in UTC (e.g. "2026-09-14 15:11:40"),
 * standard JavaScript Date constructor treats strings without "Z" or offset as local time,
 * causing a 5 hour 30 minute discrepancy against Indian Standard Time (IST).
 * This helper ensures UTC strings without timezone offset are properly recognized as UTC.
 */
export function parseDate(dateInput: string | Date | number | null | undefined): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;
  if (typeof dateInput === 'number') {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }

  let str = String(dateInput).trim();
  if (!str) return null;

  // Format "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DDTHH:mm:ss" without offset
  // If it doesn't contain Z or timezone offset (+HH:mm or -HH:mm at the end), treat as UTC
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(str)) {
    str = str.replace(' ', 'T') + 'Z';
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a date into Indian Standard Time (IST) date string or date+time string.
 * Example: "14 Sep 2026, 8:41 PM IST"
 */
export function formatIST(
  dateInput: string | Date | number | null | undefined,
  includeTime: boolean = true
): string {
  const d = parseDate(dateInput);
  if (!d) return 'N/A';

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime
      ? {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }
      : {}),
  };

  return new Intl.DateTimeFormat('en-IN', options).format(d);
}

/**
 * Formats a date string or Date object into human-friendly relative time,
 * matching standard shorthand like "Just now", "2 Min Ago", "2h Ago", "1 Day Ago", etc.,
 * accurately computed against IST / UTC current time.
 */
export function timeAgo(dateInput: string | Date | number | null | undefined): string {
  const date = parseDate(dateInput);
  if (!date) return 'N/A';

  const timestamp = date.getTime();
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  // If clock skew or future by a few seconds
  if (diffInSeconds < 0) {
    return 'Just now';
  }

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m Ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h Ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return diffInDays === 1 ? '1 Day Ago' : `${diffInDays} Days Ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? '1 Week Ago' : `${diffInWeeks} Weeks Ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? '1 Month Ago' : `${diffInMonths} Months Ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return diffInYears === 1 ? '1 Year Ago' : `${diffInYears} Years Ago`;
}
