'use client'

import { formatGolferName } from '@/lib/utils'

interface GolferBadgeProps {
  firstName: string
  lastInitial: string
  isCurrentUser?: boolean
}

export function GolferBadge({ firstName, lastInitial, isCurrentUser = false }: GolferBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${isCurrentUser 
          ? 'bg-green-100 text-green-800 ring-2 ring-green-500' 
          : 'bg-gray-100 text-gray-800'
        }
      `}
    >
      {formatGolferName(firstName, lastInitial)}
    </span>
  )
} 