'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { getCalendarDates, formatDateDisplay, isDateSelectable, getWeekLabel } from '@/lib/utils'
import { format } from 'date-fns'

interface Golfer {
  id: string
  firstName: string
  lastInitial: string
}

interface Signup {
  id: string
  golferId: string
  date: string
}

interface PendingChange {
  date: string
  action: 'add' | 'remove'
  signupId?: string
}

// Custom debounce hook
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T
  
  return debouncedCallback
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const golferId = params.id as string
  
  const [golfer, setGolfer] = useState<Golfer | null>(null)
  const [signups, setSignups] = useState<Signup[]>([])
  const [mySignups, setMySignups] = useState<Set<string>>(new Set())
  const [currentWeek, setCurrentWeek] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [isOnline, setIsOnline] = useState(true)
  
  const weeks = getCalendarDates()
  const week = weeks[currentWeek]
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Load offline changes on mount
  useEffect(() => {
    const offlineChanges = localStorage.getItem(`teeup-offline-${golferId}`)
    if (offlineChanges && isOnline) {
      const changes = JSON.parse(offlineChanges)
      setPendingChanges(changes)
      localStorage.removeItem(`teeup-offline-${golferId}`)
    }
  }, [golferId, isOnline])
  
  useEffect(() => {
    fetchGolferAndSignups()
  }, [golferId])
  
  // Hide save status after a delay
  useEffect(() => {
    if (saveStatus === 'saved' || saveStatus === 'error') {
      const timer = setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [saveStatus])
  
  const fetchGolferAndSignups = async () => {
    try {
      // Fetch all golfers and find the current one
      const golferResponse = await fetch('/api/golfers')
      if (golferResponse.ok) {
        const golfers = await golferResponse.json()
        const currentGolfer = golfers.find((g: Golfer) => g.id === golferId)
        if (currentGolfer) {
          setGolfer(currentGolfer)
        }
      }
      
      // Fetch all signups
      const signupsResponse = await fetch('/api/signups')
      if (signupsResponse.ok) {
        const data = await signupsResponse.json()
        setSignups(data)
        
        // Filter my signups
        const myDates = new Set<string>(
          data
            .filter((s: Signup) => s.golferId === golferId)
            .map((s: Signup) => s.date)
        )
        setMySignups(myDates)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Batch save function
  const processBatchChanges = useCallback(async (changes: PendingChange[]) => {
    if (changes.length === 0) return
    
    setSaveStatus('saving')
    
    try {
      // Process changes in parallel for better performance
      const promises = changes.map(async (change) => {
        if (change.action === 'add') {
          const response = await fetch('/api/signups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ golferId, date: change.date })
          })
          if (!response.ok) throw new Error('Failed to add signup')
        } else {
          if (change.signupId) {
            const response = await fetch(`/api/signups?id=${change.signupId}`, { 
              method: 'DELETE' 
            })
            if (!response.ok) throw new Error('Failed to remove signup')
          }
        }
      })
      
      await Promise.all(promises)
      
      // Clear pending changes on success
      setPendingChanges([])
      
      // Refresh data to get updated signup counts
      await fetchGolferAndSignups()
      setSaveStatus('saved')
    } catch (error) {
      console.error('Failed to save changes:', error)
      setSaveStatus('error')
      
      // Save to localStorage for offline retry
      if (!isOnline) {
        const existingOffline = localStorage.getItem(`teeup-offline-${golferId}`)
        const offlineChanges = existingOffline ? JSON.parse(existingOffline) : []
        localStorage.setItem(
          `teeup-offline-${golferId}`,
          JSON.stringify([...offlineChanges, ...changes])
        )
      }
      
      // Revert optimistic updates on error
      changes.forEach(change => {
        const newSignups = new Set(mySignups)
        if (change.action === 'add') {
          newSignups.delete(change.date)
        } else {
          newSignups.add(change.date)
        }
        setMySignups(newSignups)
      })
    }
  }, [golferId, isOnline, mySignups])
  
  // Debounced save function
  const debouncedSave = useDebounce(processBatchChanges, 500)
  
  // Process pending changes when they update
  useEffect(() => {
    if (pendingChanges.length > 0 && isOnline) {
      debouncedSave(pendingChanges)
    }
  }, [pendingChanges, debouncedSave, isOnline])
  
  const toggleDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    const wasSelected = mySignups.has(dateString)
    
    // Optimistically update UI immediately
    const newSignups = new Set(mySignups)
    if (wasSelected) {
      newSignups.delete(dateString)
    } else {
      newSignups.add(dateString)
    }
    setMySignups(newSignups)
    
    // Check if there's already a pending change for this date
    const existingChangeIndex = pendingChanges.findIndex(
      change => change.date === dateString
    )
    
    if (existingChangeIndex !== -1) {
      // If there's a pending change, we need to handle it properly
      const existingChange = pendingChanges[existingChangeIndex]
      
      // If the existing change was an 'add' and now we're removing, just cancel both
      if (existingChange.action === 'add' && wasSelected) {
        setPendingChanges(prev => prev.filter((_, index) => index !== existingChangeIndex))
        return
      }
      
      // If the existing change was a 'remove' and now we're adding, just cancel both
      if (existingChange.action === 'remove' && !wasSelected) {
        setPendingChanges(prev => prev.filter((_, index) => index !== existingChangeIndex))
        return
      }
    }
    
    // Find the signup to remove (only if it exists in the database)
    const signupToRemove = signups.find(
      s => s.golferId === golferId && s.date === dateString
    )
    
    // Only add a remove change if there's actually a signup to remove
    if (wasSelected && !signupToRemove) {
      // This was an optimistic add that hasn't been saved yet
      return
    }
    
    setPendingChanges(prev => [...prev, {
      date: dateString,
      action: wasSelected ? 'remove' : 'add',
      signupId: signupToRemove?.id
    }])
  }
  
  const getSignupsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return signups.filter(s => s.date === dateString).length
  }
  
  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentWeek > 0) {
      setCurrentWeek(currentWeek - 1)
    } else if (direction === 'next' && currentWeek < 3) {
      setCurrentWeek(currentWeek + 1)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }
  
  if (!golfer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Golfer not found</p>
      </div>
    )
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {golfer.firstName} {golfer.lastInitial}
              </h1>
              <p className="text-sm text-gray-600 font-bold">Select the days you want to play</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="bg-gray-200 text-black px-3 py-1.5 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200 shadow-sm hover:shadow border border-gray-300 text-sm"
              >
                Golfers
              </Link>
              <Link
                href="/calendar"
                className="bg-gray-200 text-black px-3 py-1.5 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200 shadow-sm hover:shadow border border-gray-300 text-sm"
              >
                View Week
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Save Status Indicator */}
      {(saveStatus !== 'idle' || !isOnline) && (
        <div className="fixed top-20 right-4 z-20 animate-fade-in">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
            !isOnline ? 'bg-yellow-600 text-white' :
            saveStatus === 'saving' ? 'bg-gray-800 text-white' :
            saveStatus === 'saved' ? 'bg-green-600 text-white' :
            'bg-red-600 text-white'
          }`}>
            {!isOnline && (
              <>
                <ExclamationCircleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Offline - changes will sync</span>
              </>
            )}
            {isOnline && saveStatus === 'saving' && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="text-sm font-medium">Saving...</span>
              </>
            )}
            {isOnline && saveStatus === 'saved' && (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Saved</span>
              </>
            )}
            {isOnline && saveStatus === 'error' && (
              <>
                <ExclamationCircleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Failed to save</span>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Week Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex flex-row gap-1 justify-center items-center">
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
        </div>
      </div>
      
      {/* Days of the Week */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {week.days.map((date) => {
            const dateString = date.toISOString().split('T')[0]
            const isSelected = mySignups.has(dateString)
            const signupCount = getSignupsForDate(date)
            const isFull = signupCount >= 8
            const selectable = isDateSelectable(date) && !isFull
            
            return (
              <div
                key={dateString}
                className={`p-4 ${selectable ? 'cursor-pointer hover:bg-gray-50' : 'opacity-60'}`}
                onClick={() => selectable && toggleDate(date)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      disabled={!selectable}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatDateDisplay(date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`text-sm px-3 py-1 rounded-full ${
                    isFull ? 'bg-red-100 text-red-800' : 
                    signupCount > 5 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {isFull ? 'Full' : `${signupCount}/8 golfers`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Helpful message */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Changes are saved automatically
          {pendingChanges.length > 0 && (
            <span className="text-gray-400"> • {pendingChanges.length} pending</span>
          )}
        </p>
      </div>
    </main>
  )
} 