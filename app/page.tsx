'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/Calendar'
import { NameInput } from '@/components/NameInput'
import { useTeeUpStore } from '@/lib/store'

export default function Home() {
  const [isClient, setIsClient] = useState(false)
  const currentGolfer = useTeeUpStore((state) => state.currentGolfer)
  const setCurrentGolfer = useTeeUpStore((state) => state.setCurrentGolfer)
  
  // Ensure we're on the client side to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Don't render until client-side to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }
  
  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      setCurrentGolfer(null)
    }
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      {!currentGolfer ? (
        <div className="min-h-screen flex items-center justify-center">
          <NameInput onComplete={() => {}} />
        </div>
      ) : (
        <div className="pb-20">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-green-700">TeeUp</h1>
                  <span className="text-2xl">⛳</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="font-medium text-gray-900">
                      {currentGolfer.firstName} {currentGolfer.lastInitial}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </header>
          
          {/* Main content */}
          <div className="py-6">
            <Calendar />
          </div>
          
          {/* Instructions */}
          <div className="max-w-6xl mx-auto px-4 mt-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">How to use TeeUp</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Tap any available day to sign up for a tee time
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Tap again to remove your signup
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Swipe or use arrows to navigate between weeks
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Maximum 8 golfers per day
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
