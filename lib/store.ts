import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { dateToString } from './date-utils'

// Types for our store
export interface Golfer {
  id: string
  firstName: string
  lastInitial: string
}

export interface Signup {
  id: string
  golferId: string
  date: string // ISO date string
  golfer?: Golfer
}

interface TeeUpStore {
  // Current user
  currentGolfer: Golfer | null
  setCurrentGolfer: (golfer: Golfer | null) => void
  
  // All signups
  signups: Signup[]
  setSignups: (signups: Signup[]) => void
  addSignup: (signup: Signup) => void
  removeSignup: (signupId: string) => void
  
  // Offline queue for syncing
  offlineQueue: {
    type: 'add' | 'remove'
    signup?: Signup
    signupId?: string
    timestamp: number
  }[]
  addToOfflineQueue: (action: { type: 'add' | 'remove'; signup?: Signup; signupId?: string }) => void
  clearOfflineQueue: () => void
  
  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  // Error handling
  error: string | null
  setError: (error: string | null) => void
}

// Create the store with persistence
export const useTeeUpStore = create<TeeUpStore>()(
  persist(
    (set) => ({
      // Current golfer
      currentGolfer: null,
      setCurrentGolfer: (golfer) => set({ currentGolfer: golfer }),
      
      // Signups
      signups: [],
      setSignups: (signups) => set({ signups }),
      addSignup: (signup) => set((state) => ({ 
        signups: [...state.signups, signup] 
      })),
      removeSignup: (signupId) => set((state) => ({ 
        signups: state.signups.filter(s => s.id !== signupId) 
      })),
      
      // Offline queue
      offlineQueue: [],
      addToOfflineQueue: (action) => set((state) => ({
        offlineQueue: [...state.offlineQueue, { ...action, timestamp: Date.now() }]
      })),
      clearOfflineQueue: () => set({ offlineQueue: [] }),
      
      // Loading state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      // Error state
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: 'teeup-storage', // Name of the storage item
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({ 
        currentGolfer: state.currentGolfer,
        signups: state.signups,
        offlineQueue: state.offlineQueue
      }), // Only persist these fields
    }
  )
)

// Helper hook to get current golfer's signups
export function useMySignups() {
  const { currentGolfer, signups } = useTeeUpStore()
  
  if (!currentGolfer) return []
  
  return signups.filter(signup => signup.golferId === currentGolfer.id)
}

// Helper hook to get signups for a specific date
export function useSignupsForDate(date: Date) {
  const { signups } = useTeeUpStore()
  const dateString = dateToString(date)
  
  return signups.filter(signup => signup.date === dateString)
} 