'use client'

import { format } from 'date-fns'
import { GolferBadge } from './GolferBadge'
import { isDateSelectable, formatDateDisplay } from '@/lib/utils'
import { useTeeUpStore, useSignupsForDate } from '@/lib/store'
import type { Golfer } from '@/lib/store'

interface DayCardProps {
  date: Date
  onToggleSignup?: (date: Date) => void
}

export function DayCard({ date, onToggleSignup }: DayCardProps) {
  const signups = useSignupsForDate(date)
  const isSelectable = isDateSelectable(date)
  
  // Get capacity info
  const spotsRemaining = 8 - signups.length
  const isFull = spotsRemaining === 0
  
  const handleClick = () => {
    // No longer interactive in calendar view
  }
  
  return (
    <div
      className={`
        p-4 rounded-lg border-2 transition-all
        ${!isSelectable 
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : isFull
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-gray-300'
        }
      `}
    >
      {/* Date header */}
      <div className="mb-3">
        <p className="font-semibold text-gray-900">
          {formatDateDisplay(date)}
        </p>
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
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No signups yet</p>
        )}
      </div>
      

    </div>
  )
} 