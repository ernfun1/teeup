'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
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

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const golferId = params.id as string
  
  const [golfer, setGolfer] = useState<Golfer | null>(null)
  const [signups, setSignups] = useState<Signup[]>([])
  const [mySignups, setMySignups] = useState<Set<string>>(new Set())
  const [currentWeek, setCurrentWeek] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const weeks = getCalendarDates()
  const week = weeks[currentWeek]
  
  useEffect(() => {
    fetchGolferAndSignups()
  }, [golferId])
  
  const fetchGolferAndSignups = async () => {
    try {
      // Fetch golfer info
      const golferResponse = await fetch(`/api/golfers?firstName=dummy&lastInitial=dummy`)
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
  
  const toggleDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    const newSignups = new Set(mySignups)
    
    if (newSignups.has(dateString)) {
      newSignups.delete(dateString)
    } else {
      newSignups.add(dateString)
    }
    
    setMySignups(newSignups)
  }
  
  const saveChanges = async () => {
    setSaving(true)
    
    try {
      // Get current signups for this golfer
      const currentSignups = signups.filter(s => s.golferId === golferId)
      const currentDates = new Set(currentSignups.map(s => s.date))
      
      // Find dates to add and remove
      const datesToAdd = Array.from(mySignups).filter(date => !currentDates.has(date))
      const datesToRemove = currentSignups.filter(s => !mySignups.has(s.date))
      
      // Add new signups
      for (const date of datesToAdd) {
        await fetch('/api/signups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ golferId, date })
        })
      }
      
      // Remove old signups
      for (const signup of datesToRemove) {
        await fetch(`/api/signups?id=${signup.id}`, { method: 'DELETE' })
      }
      
      // Refresh data
      await fetchGolferAndSignups()
    } catch (error) {
      console.error('Failed to save changes:', error)
    } finally {
      setSaving(false)
    }
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Book Tee Times for {golfer.firstName} {golfer.lastInitial}
              </h1>
              <p className="text-sm text-gray-600">Select the days you want to play</p>
            </div>
            
            <div className="flex gap-2">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900"
              >
                Back
              </Link>
              <Link
                href="/calendar"
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
              >
                This Week
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Week Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateWeek('prev')}
              disabled={currentWeek === 0}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            
            <h2 className="text-lg font-semibold text-gray-900">
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
                      <p className="text-sm text-gray-500">
                        {format(date, 'MMMM d, yyyy')}
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
        
        {/* Save Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={saveChanges}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </main>
  )
} 