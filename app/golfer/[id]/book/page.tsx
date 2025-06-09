'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { getCalendarDates, formatDateDisplay, isDateSelectable, getWeekLabel } from '@/lib/utils'
import { format } from 'date-fns'
import { dateToString } from '@/lib/date-utils'

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
  const [isProcessing, setIsProcessing] = useState(false)
  const [tempSignupIds, setTempSignupIds] = useState<Map<string, string>>(new Map())
  
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
      console.log('Fetching golfer and signups...')
      
      // Fetch all golfers and find the current one
      const golferResponse = await fetch('/api/golfers', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      if (golferResponse.ok) {
        const golfers = await golferResponse.json()
        const currentGolfer = golfers.find((g: Golfer) => g.id === golferId)
        if (currentGolfer) {
          setGolfer(currentGolfer)
        }
      }
      
      // Fetch all signups
      const signupsResponse = await fetch('/api/signups', {
        cache: 'no-store', 
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      if (signupsResponse.ok) {
        const data = await signupsResponse.json()
        console.log('All signups fetched:', data.length)
        setSignups(data)
        
        // Filter my signups
        const mySignupData = data.filter((s: Signup) => s.golferId === golferId)
        console.log('My signups:', mySignupData)
        
        const myDates = new Set<string>(
          mySignupData.map((s: Signup) => s.date)
        )
        console.log('My booked dates:', Array.from(myDates))
        
        // Force clear and reset to ensure React detects the change
        setMySignups(new Set())
        setTimeout(() => {
          setMySignups(myDates)
        }, 0)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Batch save function
  const processBatchChanges = useCallback(async (changes: PendingChange[]) => {
    if (changes.length === 0 || isProcessing) return
    
    console.log('Processing batch changes:', changes)
    
    setIsProcessing(true)
    setSaveStatus('saving')
    
    try {
      // Deduplicate changes - keep only the latest change for each date
      const changeMap = new Map<string, PendingChange>()
      changes.forEach(change => {
        changeMap.set(change.date, change)
      })
      const uniqueChanges = Array.from(changeMap.values())
      
      console.log('Unique changes to process:', uniqueChanges)
      
      // Process changes sequentially to avoid race conditions
      for (const change of uniqueChanges) {
        if (change.action === 'add') {
          console.log('Adding signup for date:', change.date)
          const response = await fetch('/api/signups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ golferId, date: change.date })
          })
          if (!response.ok) {
            const errorData = await response.json()
            // Skip if already signed up (not an error in rapid clicking scenario)
            if (!errorData.error?.includes('already signed up')) {
              console.error('Failed to add signup:', errorData)
              throw new Error(errorData.error || 'Failed to add signup')
            }
          } else {
            // Store the newly created signup ID for potential future removal
            const newSignup = await response.json()
            setTempSignupIds(prev => new Map(prev).set(change.date, newSignup.id))
            console.log('Created signup with ID:', newSignup.id, 'for date:', change.date)
          }
        } else {
          // For remove action, try to use the signupId from the change,
          // or look it up from tempSignupIds if it was just created
          let signupIdToRemove = change.signupId
          
          if (!signupIdToRemove) {
            signupIdToRemove = tempSignupIds.get(change.date)
            console.log('Using temp signup ID:', signupIdToRemove, 'for date:', change.date)
          }
          
          if (signupIdToRemove) {
            console.log('Removing signup:', signupIdToRemove, 'for date:', change.date)
            const response = await fetch(`/api/signups?id=${signupIdToRemove}`, { 
              method: 'DELETE' 
            })
            if (!response.ok) {
              const errorData = await response.json()
              console.error('Failed to remove signup:', errorData)
              throw new Error(errorData.error || 'Failed to remove signup')
            }
            // Clear the temp signup ID after successful removal
            setTempSignupIds(prev => {
              const newMap = new Map(prev)
              newMap.delete(change.date)
              return newMap
            })
          } else {
            console.warn('No signupId for remove action on date:', change.date)
          }
        }
      }
      
      // Clear pending changes on success
      setPendingChanges([])
      
      // Add a small delay to ensure database operations complete
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Refresh data to get updated signup counts
      await fetchGolferAndSignups()
      
      // Clear temp signup IDs after successful refresh
      setTempSignupIds(new Map())
      
      setSaveStatus('saved')
      console.log('Batch changes processed successfully')
    } catch (error) {
      console.error('Failed to save changes:', error)
      setSaveStatus('error')
      
      // Show alert with detailed error message (but not for "already signed up")
      if (error instanceof Error && !error.message.includes('already signed up')) {
        alert(`Error: ${error.message}`)
      }
      
      // Save to localStorage for offline retry
      if (!isOnline) {
        const existingOffline = localStorage.getItem(`teeup-offline-${golferId}`)
        const offlineChanges = existingOffline ? JSON.parse(existingOffline) : []
        localStorage.setItem(
          `teeup-offline-${golferId}`,
          JSON.stringify([...offlineChanges, ...changes])
        )
      }
      
      // Refresh data to sync UI with database
      await fetchGolferAndSignups()
    } finally {
      setIsProcessing(false)
    }
  }, [golferId, isOnline, isProcessing, tempSignupIds])
  
  // Debounced save function
  const debouncedSave = useDebounce(processBatchChanges, 800)
  
  // Process pending changes when they update
  useEffect(() => {
    if (pendingChanges.length > 0 && isOnline) {
      debouncedSave(pendingChanges)
    }
  }, [pendingChanges, debouncedSave, isOnline])
  
  const toggleDate = (date: Date) => {
    const dateString = dateToString(date)
    const wasSelected = mySignups.has(dateString)
    
    console.log('Toggle date:', dateString, 'Was selected:', wasSelected)
    console.log('Current mySignups:', Array.from(mySignups))
    
    // Check if there's already a pending change for this date
    const existingChangeIndex = pendingChanges.findIndex(
      change => change.date === dateString
    )
    
    if (existingChangeIndex !== -1) {
      // If there's a pending change, we need to handle it properly
      const existingChange = pendingChanges[existingChangeIndex]
      console.log('Found existing pending change:', existingChange)
      
      // If the date was selected and we're clicking to unselect it,
      // and there's a pending 'add' change, just cancel the add
      if (existingChange.action === 'add' && wasSelected) {
        console.log('Canceling pending add')
        // Remove the pending add change
        setPendingChanges(prev => prev.filter((_, index) => index !== existingChangeIndex))
        // Revert the optimistic UI update
        setMySignups(prev => {
          const newSet = new Set(prev)
          newSet.delete(dateString)
          return newSet
        })
        return
      }
      
      // If the date was not selected and we're clicking to select it,
      // and there's a pending 'remove' change, just cancel the remove
      if (existingChange.action === 'remove' && !wasSelected) {
        console.log('Canceling pending remove')
        // Remove the pending remove change
        setPendingChanges(prev => prev.filter((_, index) => index !== existingChangeIndex))
        // Revert the optimistic UI update
        setMySignups(prev => {
          const newSet = new Set(prev)
          newSet.add(dateString)
          return newSet
        })
        return
      }
    }
    
    // Find the signup to remove (only if it exists in the database)
    const signupToRemove = signups.find(
      s => s.golferId === golferId && s.date === dateString
    )
    
    console.log('Creating new pending change:', wasSelected ? 'remove' : 'add', 'SignupId:', signupToRemove?.id)
    
    // Optimistically update UI
    setMySignups(prev => {
      const newSet = new Set(prev)
      if (wasSelected) {
        newSet.delete(dateString)
      } else {
        newSet.add(dateString)
      }
      return newSet
    })
    
    // Add the change to pending changes
    setPendingChanges(prev => [...prev, {
      date: dateString,
      action: wasSelected ? 'remove' : 'add',
      signupId: signupToRemove?.id
    }])
  }
  
  const getSignupsForDate = (date: Date) => {
    const dateString = dateToString(date)
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
              <p className="text-sm text-gray-600 font-bold">Click days to book or unbook</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="bg-gray-200 text-black px-2 py-1 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200 shadow-sm hover:shadow border border-gray-300 text-sm"
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
            const dateString = dateToString(date)
            const isSelected = mySignups.has(dateString)
            const signupCount = getSignupsForDate(date)
            const isFull = signupCount >= 8
            const selectable = isDateSelectable(date) && !isFull
            
            return (
              <div
                key={dateString}
                className={`p-4 ${selectable ? 'cursor-pointer hover:bg-gray-50' : 'opacity-60'}`}
                onClick={() => selectable && toggleDate(date)}
                title={
                  !selectable ? 'Past dates cannot be modified' :
                  isSelected ? 'Click to cancel your booking for this day' :
                  'Click to book this day'
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      disabled={!selectable}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500 pointer-events-none"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatDateDisplay(date)}
                      </p>
                      {isSelected && selectable && (
                        <p className="text-xs text-green-600">You're booked for this day</p>
                      )}
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
        
        {/* Debug info - remove this in production */}
        <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
          <p className="font-bold">Debug Info:</p>
          <p>My booked dates: {Array.from(mySignups).join(', ') || 'None'}</p>
          <p>Pending changes: {pendingChanges.length}</p>
          <p>Processing: {isProcessing ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </main>
  )
} 