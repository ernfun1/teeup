'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/24/outline'

interface Golfer {
  id: string
  firstName: string
  lastInitial: string
  mobileNumber?: string
}

export default function Home() {
  const [golfers, setGolfers] = useState<Golfer[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ firstName: '', lastInitial: '', mobileNumber: '' })

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

  const handleEdit = (golfer: Golfer) => {
    setEditingId(golfer.id)
    setEditForm({
      firstName: golfer.firstName,
      lastInitial: golfer.lastInitial,
      mobileNumber: golfer.mobileNumber || ''
    })
  }

  const handleSave = async () => {
    if (!editingId) return

    try {
      const response = await fetch('/api/golfers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          ...editForm
        })
      })

      if (response.ok) {
        await fetchGolfers()
        setEditingId(null)
      }
    } catch (error) {
      console.error('Failed to update golfer:', error)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({ firstName: '', lastInitial: '', mobileNumber: '' })
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
                TeeUp <span>⛳</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">Click your name to book tee times</p>
            </div>
            
            <Link
              href="/calendar"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              This Week
            </Link>
          </div>
        </div>
      </header>

      {/* Golfers List */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {golfers.map((golfer) => (
                <div key={golfer.id} className="p-4 hover:bg-gray-50 transition-colors">
                  {editingId === golfer.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="First name"
                        />
                        <input
                          type="text"
                          value={editForm.lastInitial}
                          onChange={(e) => setEditForm({ ...editForm, lastInitial: e.target.value.slice(0, 1) })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Initial"
                          maxLength={1}
                        />
                        <input
                          type="tel"
                          value={editForm.mobileNumber}
                          onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Mobile number"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/golfer/${golfer.id}/book`}
                        className="flex-1"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {golfer.firstName} {golfer.lastInitial}
                            </h3>
                            <p className="text-sm text-gray-500">{golfer.mobileNumber || 'No number'}</p>
                          </div>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleEdit(golfer)}
                        className="ml-4 p-2 text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
