'use client'

import { format } from 'date-fns'
import { GolferBadge } from './GolferBadge'
import { isDateSelectable, formatDateDisplay } from '@/lib/utils'
import { useTeeUpStore, useSignupsForDate } from '@/lib/store'
import type { Golfer } from '@/lib/store'

interface DayCardProps {
  date: Date
  onToggleSignup: (date: Date) => void
}

export function DayCard({ date, onToggleSignup }: DayCardProps) {
  const currentGolfer = useTeeUpStore((state) => state.currentGolfer)
  const signups = useSignupsForDate(date)
  const isSelectable = isDateSelectable(date)
  
  // Check if current user is signed up
  const isSignedUp = currentGolfer && signups.some(s => s.golferId === currentGolfer.id)
  
  // Get capacity info
  const spotsRemaining = 8 - signups.length
  const isFull = spotsRemaining === 0
  
  const handleClick = () => {
    if (isSelectable && !isFull) {
      onToggleSignup(date)
    }
  }
  
  return (
    <div
      onClick={handleClick}
      className={`
        p-4 rounded-lg border-2 transition-all
        ${!isSelectable 
          ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
          : isFull
          ? 'bg-red-50 border-red-200 cursor-not-allowed'
          : isSignedUp
          ? 'bg-green-50 border-green-500 cursor-pointer hover:bg-green-100'
          : 'bg-white border-gray-300 cursor-pointer hover:border-green-500 hover:shadow-md'
        }
      `}
    >
      {/* Date header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-900">
            {formatDateDisplay(date)}
          </p>
          <p className="text-sm text-gray-500">
            {format(date, 'MMM d')}
          </p>
        </div>
        <div className={`
          text-xs px-2 py-1 rounded-full
          ${isFull 
            ? 'bg-red-100 text-red-800' 
            : spotsRemaining <= 3
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-600'
          }
        `}>
          {isFull ? 'Full' : `${spotsRemaining} spots`}
        </div>
      </div>
      
      {/* Signups list */}
      <div className="space-y-1">
        {signups.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {signups.map((signup) => (
              <GolferBadge
                key={signup.id}
                firstName={signup.golfer?.firstName || ''}
                lastInitial={signup.golfer?.lastInitial || ''}
                isCurrentUser={currentGolfer?.id === signup.golferId}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No signups yet</p>
        )}
      </div>
      
      {/* Action hint */}
      {isSelectable && !isFull && (
        <div className="mt-3 text-xs text-center">
          {isSignedUp ? (
            <span className="text-green-600 font-medium">✓ You're signed up</span>
          ) : (
            <span className="text-gray-500">Tap to sign up</span>
          )}
        </div>
      )}
    </div>
  )
} 