'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Lazy load the Calendar component for better performance on older devices
const Calendar = dynamic(() => import('@/components/Calendar').then(mod => ({ default: mod.Calendar })), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  ),
  ssr: false // Disable SSR for better client-side performance
})

export default function CalendarPage() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
                TeeUp Calendar <span>⛳</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">See who's playing this week</p>
            </div>
            
            <Link
              href="/"
              className="bg-gray-200 text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200 shadow-sm hover:shadow border border-gray-300"
            >
              Back to Golfers
            </Link>
          </div>
        </div>
      </header>
      
      {/* Calendar */}
      <div className="py-6">
        <Calendar />
      </div>
    </main>
  )
} 