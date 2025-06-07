'use client'

import { useState, useEffect } from 'react'

interface Golfer {
  id: string
  firstName: string
  lastInitial: string
  mobileNumber?: string | null
}

interface GolferModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  golfer?: Golfer | null
}

export default function GolferModal({ isOpen, onClose, onSave, golfer }: GolferModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastInitial, setLastInitial] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (golfer) {
      setFirstName(golfer.firstName)
      setLastInitial(golfer.lastInitial)
      setMobileNumber(golfer.mobileNumber || '')
    } else {
      setFirstName('')
      setLastInitial('')
      setMobileNumber('')
    }
    setError('')
  }, [golfer, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = golfer 
        ? `/api/golfers/${golfer.id}`
        : '/api/golfers'
      
      const method = golfer ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName: firstName.trim(), 
          lastInitial: lastInitial.trim().toUpperCase(),
          mobileNumber: mobileNumber.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save golfer')
      } else {
        onSave()
        onClose()
      }
    } catch (err) {
      setError('Failed to save golfer')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {golfer ? 'Edit Golfer' : 'Add New Golfer'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Initial *
            </label>
            <input
              type="text"
              value={lastInitial}
              onChange={(e) => setLastInitial(e.target.value)}
              maxLength={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          {error && (
            <p className="text-red-600 text-sm mb-4">{error}</p>
          )}
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2.5 px-5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2.5 px-5 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 