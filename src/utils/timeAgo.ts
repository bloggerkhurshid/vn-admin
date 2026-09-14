/**
 * Formats a date string or Date object into human-friendly relative time,
 * matching standard shorthand like "Just now", "2 Min Ago", "2h Ago", "1 Day Ago", etc.
 */
export function timeAgo(dateInput: string | Date | number | null | undefined): string {
  if (!dateInput) return 'N/A';

  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  const timestamp = date.getTime();
  if (isNaN(timestamp)) return 'N/A';

  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  if (diffInSeconds < 0) {
    return 'Just now';
  }

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} Min Ago`;
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
