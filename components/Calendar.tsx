'use client'

import { useState, useEffect } from 'react'
import { DayCard } from './DayCard'
import { getCalendarDates, getWeekLabel } from '@/lib/utils'
import { useTeeUpStore } from '@/lib/store'

export function Calendar() {
  const [currentWeek, setCurrentWeek] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { 
    signups, 
    setSignups
  } = useTeeUpStore()
  
  const weeks = getCalendarDates()
  const week = weeks[currentWeek]
  
  // Fetch signups on mount
  useEffect(() => {
    fetchSignups()
    // Set up polling for real-time updates
    const interval = setInterval(fetchSignups, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])
  
  const fetchSignups = async () => {
    try {
      setError(null)
      // Add timestamp to prevent caching
      const response = await fetch(`/api/signups?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Calendar: Fetched', data.length, 'signups')
        setSignups(data)
      } else {
        console.error('Calendar: Failed to fetch signups, status:', response.status)
        setError(`Failed to load signups (status: ${response.status})`)
      }
    } catch (error) {
      console.error('Calendar: Failed to fetch signups:', error)
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }
  
  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentWeek > 0) {
      setCurrentWeek(currentWeek - 1)
    } else if (direction === 'next' && currentWeek < 3) {
      setCurrentWeek(currentWeek + 1)
    }
  }
  
  // Handle swipe gestures for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    
    if (isLeftSwipe) {
      navigateWeek('next')
    } else if (isRightSwipe) {
      navigateWeek('prev')
    }
  }
  
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Navigation buttons - optimized for mobile */}
      <div className="flex flex-row gap-1 justify-center items-center mb-6">
        <button
          onClick={() => navigateWeek('prev')}
          disabled={currentWeek === 0}
          className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-gray-700 disabled:text-gray-400 transition-all duration-200 shadow-sm hover:shadow border border-gray-300 text-sm"
          aria-label="Go to previous week"
        >
          <span className="text-lg">←</span>
          <span>Last Week</span>
        </button>
        
        <button
          onClick={() => navigateWeek('next')}
          disabled={currentWeek === 3}
          className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-gray-700 disabled:text-gray-400 transition-all duration-200 shadow-sm hover:shadow border border-gray-300 text-sm"
          aria-label="Go to next week"
        >
          <span>Next Week</span>
          <span className="text-lg">→</span>
        </button>
      </div>
      
      {/* Calendar grid */}
      <div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {week.days.map((date) => (
          <DayCard
            key={date.toISOString()}
            date={date}
          />
        ))}
      </div>
      
      {/* Debug info for mobile */}
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>Total signups loaded: {signups.length}</p>
        {isLoading && <p className="text-blue-600">Loading signups...</p>}
        {error && <p className="text-red-600">{error}</p>}
      </div>

    </div>
  )
} 