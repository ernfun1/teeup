'use client'

import { useState, useEffect } from 'react'
import { DayCard } from './DayCard'
import { getCalendarDates, getWeekLabel } from '@/lib/utils'
import { useTeeUpStore } from '@/lib/store'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export function Calendar() {
  const [currentWeek, setCurrentWeek] = useState(0)
  
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
      const response = await fetch('/api/signups')
      if (response.ok) {
        const data = await response.json()
        setSignups(data)
      }
    } catch (error) {
      console.error('Failed to fetch signups:', error)
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateWeek('prev')}
          disabled={currentWeek === 0}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-gray-900">
          {getWeekLabel(currentWeek + 1)}
        </h2>
        
        <button
          onClick={() => navigateWeek('next')}
          disabled={currentWeek === 3}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      
      {/* Week indicator dots */}
      <div className="flex justify-center gap-2 mb-6">
        {[0, 1, 2, 3].map((weekIndex) => (
          <button
            key={weekIndex}
            onClick={() => setCurrentWeek(weekIndex)}
            className={`w-2 h-2 rounded-full transition-colors ${
              weekIndex === currentWeek ? 'bg-green-600' : 'bg-gray-300'
            }`}
          />
        ))}
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
      

    </div>
  )
} 