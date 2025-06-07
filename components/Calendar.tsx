'use client'

import { useState, useEffect, useCallback } from 'react'
import { DayCard } from './DayCard'
import { getCalendarDates, getWeekLabel } from '@/lib/utils'
import { useTeeUpStore } from '@/lib/store'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export function Calendar() {
  const [currentWeek, setCurrentWeek] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const { 
    currentGolfer, 
    signups, 
    setSignups, 
    addSignup, 
    removeSignup,
    addToOfflineQueue,
    offlineQueue,
    clearOfflineQueue
  } = useTeeUpStore()
  
  const weeks = getCalendarDates()
  const week = weeks[currentWeek]
  
  // Fetch signups on mount and when user changes
  useEffect(() => {
    if (currentGolfer) {
      fetchSignups()
    }
  }, [currentGolfer])
  
  // Process offline queue when back online
  useEffect(() => {
    if (navigator.onLine && offlineQueue.length > 0) {
      processOfflineQueue()
    }
  }, [offlineQueue])
  
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
  
  const processOfflineQueue = async () => {
    for (const action of offlineQueue) {
      if (action.type === 'add' && action.signup) {
        await handleSignup(new Date(action.signup.date), false)
      } else if (action.type === 'remove' && action.signupId) {
        await handleRemoveSignup(action.signupId, false)
      }
    }
    clearOfflineQueue()
  }
  
  const handleToggleSignup = async (date: Date) => {
    if (!currentGolfer) return
    
    const dateString = date.toISOString().split('T')[0]
    const existingSignup = signups.find(
      s => s.golferId === currentGolfer.id && s.date === dateString
    )
    
    if (existingSignup) {
      await handleRemoveSignup(existingSignup.id, true)
    } else {
      await handleSignup(date, true)
    }
  }
  
  const handleSignup = async (date: Date, updateStore: boolean = true) => {
    if (!currentGolfer) return
    
    const dateString = date.toISOString().split('T')[0]
    setIsLoading(true)
    
    // Optimistic update
    const tempSignup = {
      id: `temp-${Date.now()}`,
      golferId: currentGolfer.id,
      date: dateString,
      golfer: currentGolfer
    }
    
    if (updateStore) {
      addSignup(tempSignup)
    }
    
    try {
      const response = await fetch('/api/signups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          golferId: currentGolfer.id,
          date: dateString
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create signup')
      }
      
      const newSignup = await response.json()
      
      // Replace temp signup with real one
      removeSignup(tempSignup.id)
      addSignup(newSignup)
    } catch (error) {
      // Revert optimistic update
      if (updateStore) {
        removeSignup(tempSignup.id)
      }
      
      // Add to offline queue if offline
      if (!navigator.onLine) {
        addToOfflineQueue({
          type: 'add',
          signup: tempSignup
        })
      }
      
      console.error('Failed to sign up:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleRemoveSignup = async (signupId: string, updateStore: boolean = true) => {
    setIsLoading(true)
    
    // Store the signup for potential restoration
    const signupToRemove = signups.find(s => s.id === signupId)
    
    // Optimistic update
    if (updateStore && signupToRemove) {
      removeSignup(signupId)
    }
    
    try {
      const response = await fetch(`/api/signups?id=${signupId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to remove signup')
      }
    } catch (error) {
      // Revert optimistic update
      if (updateStore && signupToRemove) {
        addSignup(signupToRemove)
      }
      
      // Add to offline queue if offline
      if (!navigator.onLine) {
        addToOfflineQueue({
          type: 'remove',
          signupId
        })
      }
      
      console.error('Failed to remove signup:', error)
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
            onToggleSignup={handleToggleSignup}
          />
        ))}
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            <span className="text-sm text-gray-600">Updating...</span>
          </div>
        </div>
      )}
      
      {/* Offline indicator */}
      {!navigator.onLine && (
        <div className="fixed bottom-4 left-4 bg-yellow-100 text-yellow-800 rounded-lg shadow-lg p-3">
          <span className="text-sm">Offline - changes will sync when connected</span>
        </div>
      )}
    </div>
  )
} 