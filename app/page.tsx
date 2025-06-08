'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'

// Lazy load the GolferModal component for better performance on older devices
const GolferModal = dynamic(() => import('@/components/GolferModal'), {
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
  ),
  ssr: false // Disable SSR for better client-side performance
})

interface Golfer {
  id: string
  firstName: string
  lastInitial: string
  mobileNumber?: string | null
}

export default function Home() {
  const [golfers, setGolfers] = useState<Golfer[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedGolfer, setSelectedGolfer] = useState<Golfer | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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

  const handleAddGolfer = () => {
    setSelectedGolfer(null)
    setModalOpen(true)
  }

  const handleEditGolfer = (golfer: Golfer) => {
    setSelectedGolfer(golfer)
    setModalOpen(true)
  }

  const handleDeleteGolfer = async (golferId: string) => {
    try {
      const response = await fetch(`/api/golfers/${golferId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchGolfers()
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Failed to delete golfer:', error)
    }
  }

  const handleModalSave = () => {
    fetchGolfers()
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
              <p className="text-sm text-gray-600 mt-1">Click your name to select days to play</p>
            </div>
            
            <Link
              href="/calendar"
              className="bg-gray-200 text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200 shadow-sm hover:shadow border border-gray-300"
            >
              View Week
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
            <>
              <div className="divide-y divide-gray-200">
                {golfers.map((golfer) => (
                  <div key={golfer.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/golfer/${golfer.id}/book`}
                        className="flex-1"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-green-700 transition-colors">
                              {golfer.firstName} {golfer.lastInitial}
                            </h3>
                            <p className="text-sm text-gray-500">{golfer.mobileNumber || 'No number'}</p>
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleEditGolfer(golfer)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit golfer"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        {deleteConfirm === golfer.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteGolfer(golfer.id)}
                              className="text-red-600 hover:text-red-700 text-sm px-2 py-1"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-gray-600 hover:text-gray-700 text-sm px-2 py-1"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(golfer.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete golfer"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Stats */}
              <div className="p-4 bg-gray-50 border-t">
                <p className="text-sm text-gray-600">
                  Total golfers: <span className="font-semibold">{golfers.length}</span> / 50
                  <span className="mx-2">•</span>
                  Available slots: <span className="font-semibold">{50 - golfers.length}</span>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Add Golfer button moved to bottom */}
        <div className="mt-6 text-center">
          <button
            onClick={handleAddGolfer}
            disabled={golfers.length >= 50}
            className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-black text-sm transition-all duration-200 shadow-sm hover:shadow border border-gray-300"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Golfer</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      <GolferModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
        golfer={selectedGolfer}
      />
    </main>
  )
}
