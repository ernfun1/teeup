/**
 * Date utilities for consistent date handling across the app.
 * 
 * IMPORTANT: All dates in this app are "date-only" (no time component).
 * We store dates as UTC midnight to avoid timezone issues.
 */

/**
 * Convert a Date object to YYYY-MM-DD string format.
 * This ensures consistent formatting regardless of timezone.
 */
export function dateToString(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse a YYYY-MM-DD string to a Date object at UTC midnight.
 * This ensures the date doesn't shift due to timezone differences.
 */
export function stringToDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}

/**
 * Get today's date at UTC midnight.
 */
export function getTodayUTC(): Date {
  const now = new Date()
  return new Date(Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0, 0, 0, 0
  ))
}

/**
 * Create a date at UTC midnight from year, month, day.
 */
export function createDateUTC(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}

/**
 * Check if two dates represent the same day (ignoring time).
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return dateToString(date1) === dateToString(date2)
} 