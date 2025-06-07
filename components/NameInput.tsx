'use client'

import { useState } from 'react'
import { useTeeUpStore } from '@/lib/store'

interface NameInputProps {
  onComplete: () => void
}

export function NameInput({ onComplete }: NameInputProps) {
  const [firstName, setFirstName] = useState('')
  const [lastInitial, setLastInitial] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const setCurrentGolfer = useTeeUpStore((state) => state.setCurrentGolfer)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate inputs
    if (!firstName || !lastInitial) {
      setError('Please enter both your first name and last initial')
      return
    }
    
    if (!/^[A-Za-z]{2,15}$/.test(firstName)) {
      setError('First name must be 2-15 letters only')
      return
    }
    
    if (!/^[A-Za-z]$/.test(lastInitial)) {
      setError('Last initial must be a single letter')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Create or find the golfer
      const response = await fetch('/api/golfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastInitial: lastInitial.trim().toUpperCase()
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create golfer')
      }
      
      // Store the golfer in our state
      setCurrentGolfer(data)
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Welcome to TeeUp! ⛳
        </h2>
        
        <p className="text-gray-600 mb-6 text-center">
          Enter your name to start booking tee times
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="John"
              autoCapitalize="words"
              autoComplete="given-name"
              maxLength={15}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="lastInitial" className="block text-sm font-medium text-gray-700 mb-1">
              Last Initial
            </label>
            <input
              type="text"
              id="lastInitial"
              value={lastInitial}
              onChange={(e) => setLastInitial(e.target.value.slice(-1))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="S"
              autoCapitalize="characters"
              maxLength={1}
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Loading...' : 'Start Booking'}
          </button>
        </form>
      </div>
    </div>
  )
} 