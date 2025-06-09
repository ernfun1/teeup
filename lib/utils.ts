import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { startOfWeek, endOfWeek, addWeeks, format, isToday, isPast, startOfDay } from 'date-fns'
import { getTodayUTC, createDateUTC, isSameDay } from './date-utils'

// Utility function to merge Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get the start of the current week (Monday)
export function getCurrentWeekStart() {
  const today = getTodayUTC()
  const dayOfWeek = today.getUTCDay() // 0 = Sunday, 1 = Monday, etc.
  
  // If today is Sunday (0), start with tomorrow (Monday)
  // Otherwise, get the Monday of the current week
  if (dayOfWeek === 0) {
    // Today is Sunday, so start with tomorrow (Monday)
    const tomorrow = new Date(today)
    tomorrow.setUTCDate(today.getUTCDate() + 1)
    return startOfWeek(tomorrow, { weekStartsOn: 1 })
  } else {
    // For any other day, use the Monday of the current week
    return startOfWeek(today, { weekStartsOn: 1 })
  }
}

// Get dates for the 4-week calendar
export function getCalendarDates() {
  const today = getTodayUTC()
  const currentWeekStart = getCurrentWeekStart()
  
  const weeks = []
  
  // Generate 4 weeks worth of dates
  for (let week = 0; week < 4; week++) {
    const weekStart = addWeeks(currentWeekStart, week)
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 }) // Monday start
    
    const days = []
    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStart)
      date.setUTCDate(date.getUTCDate() + day)
      days.push(date)
    }
    
    weeks.push({
      weekNumber: week + 1,
      startDate: weekStart,
      endDate: weekEnd,
      days
    })
  }
  
  return weeks
}

// Format a golfer's display name
export function formatGolferName(firstName: string, lastInitial: string) {
  return `${firstName} ${lastInitial.toUpperCase()}`
}

// Check if a date is selectable (not in the past)
export function isDateSelectable(date: Date) {
  const today = getTodayUTC()
  return date >= today
}

// Format date for display
export function formatDateDisplay(date: Date) {
  const today = getTodayUTC()
  if (isSameDay(date, today)) {
    return 'Today'
  }
  return format(date, 'EEE, MMM d')
}

// Get the week label (e.g., "This Week", "Next Week", etc.)
export function getWeekLabel(weekNumber: number) {
  switch (weekNumber) {
    case 1:
      return 'This Week'
    case 2:
      return 'Next Week'
    case 3:
    case 4:
      return `Week ${weekNumber}`
    default:
      return `Week ${weekNumber}`
  }
} 