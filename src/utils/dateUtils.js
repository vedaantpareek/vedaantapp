import { APP_DATE } from './constants';

/**
 * Returns a date relative to the app's base date (April 3, 2026).
 * Used for generating realistic "recent" timestamps in mock data.
 * @param {number} daysOffset - negative = past, positive = future
 * @returns {Date}
 */
export function relativeToAppDate(daysOffset = 0) {
  const d = new Date(APP_DATE);
  d.setDate(d.getDate() + daysOffset);
  return d;
}

/**
 * Formats a date for display (e.g., "April 3, 2026").
 * @param {Date|string} date
 * @returns {string}
 */
export function formatFullDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a date for calendar display (e.g., "Apr 3").
 * @param {Date|string} date
 * @returns {string}
 */
export function formatShortDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Formats a timestamp for chat display (e.g., "2:35 PM" or "Yesterday" or "Mar 29").
 * @param {Date|string} date
 * @returns {string}
 */
export function formatChatTimestamp(date) {
  const d = new Date(date);
  const appNow = new Date(APP_DATE);
  const diffMs = appNow - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return formatShortDate(d);
  }
}

/**
 * Formats a news feed post timestamp (e.g., "2 hours ago", "3 days ago").
 * @param {Date|string} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  const d = new Date(date);
  const appNow = new Date(APP_DATE);
  const diffMs = appNow - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatShortDate(d);
}

/**
 * Formats event time range (e.g., "9:00 AM – 5:00 PM").
 * @param {string} startDate
 * @param {string} endDate
 * @returns {string}
 */
export function formatEventTimeRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  const startStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (!end) return startStr;
  const endStr = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${startStr} – ${endStr}`;
}

/**
 * Returns true if two dates are the same calendar day.
 */
export function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Returns YYYY-MM-DD format string from Date.
 */
export function toDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
