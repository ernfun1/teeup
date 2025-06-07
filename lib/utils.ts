import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { startOfWeek, endOfWeek, addWeeks, format, isToday, isPast, startOfDay } from 'date-fns'

// Utility function to merge Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get the start of the current week (Sunday)
export function getCurrentWeekStart() {
  return startOfWeek(new Date(), { weekStartsOn: 0 }) // 0 = Sunday
}

// Get dates for the 4-week calendar
export function getCalendarDates() {
  const today = startOfDay(new Date())
  const currentWeekStart = getCurrentWeekStart()
  
  const weeks = []
  
  // Generate 4 weeks worth of dates
  for (let week = 0; week < 4; week++) {
    const weekStart = addWeeks(currentWeekStart, week)
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
    
    const days = []
    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + day)
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
  return !isPast(startOfDay(date)) || isToday(date)
}

// Format date for display
export function formatDateDisplay(date: Date) {
  if (isToday(date)) {
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