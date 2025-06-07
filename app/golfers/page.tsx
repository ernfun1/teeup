'use client'

import { useEffect, useState } from 'react'

interface Golfer {
  id: string
  firstName: string
  lastInitial: string
}

export default function GolfersPage() {
  const [golfers, setGolfers] = useState<Golfer[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchGolfers()
  }, [])
  
  const fetchGolfers = async () => {
    try {
      const response = await fetch('/api/golfers')
      if (response.ok) {
        const data = await response.json()
        setGolfers(data)
      }
    } catch (error) {
      console.error('Failed to fetch golfers:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Registered Golfers</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-4">
            Use any of these existing names to log in, or create a new golfer (up to 50 total).
          </p>
          
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-2">
              {golfers.map((golfer) => (
                <div key={golfer.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="font-medium">{golfer.firstName} {golfer.lastInitial}</span>
                  <span className="text-sm text-gray-500">ID: {golfer.id.slice(0, 8)}...</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600">
              Total golfers: <span className="font-semibold">{golfers.length}</span> / 50
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Available slots: <span className="font-semibold">{50 - golfers.length}</span>
            </p>
          </div>
          
          <a href="/" className="mt-4 block text-center text-green-600 hover:text-green-700">
            ← Back to TeeUp
          </a>
        </div>
      </div>
    </div>
  )
} 