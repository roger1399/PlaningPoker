import { create } from 'zustand'

interface User {
  id: string
  name: string
  hasEstimated: boolean
  estimate: number | null
}

interface PlanningPokerStore {
  currentUser: User | null
  users: User[]
  showEstimates: boolean
  setCurrentUser: (user: User) => void
  addUser: (user: User) => void
  removeUser: (userId: string) => void
  setEstimate: (userId: string, estimate: number) => void
  setShowEstimates: (show: boolean) => void
  clearEstimates: () => void
  clearSession: () => void
}

export const useStore = create<PlanningPokerStore>((set) => ({
  currentUser: null,
  users: [],
  showEstimates: false,
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  addUser: (user) =>
    set((state) => ({
      users: [...state.users.filter((u) => u.id !== user.id), user],
    })),
    
  removeUser: (userId) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    })),
    
  setEstimate: (userId, estimate) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId
          ? { ...user, estimate, hasEstimated: true }
          : user
      ),
    })),
    
  setShowEstimates: (show) => set({ showEstimates: show }),
  
  clearEstimates: () =>
    set((state) => ({
      users: state.users.map((user) => ({
        ...user,
        estimate: null,
        hasEstimated: false,
      })),
      showEstimates: false,
    })),
    
  clearSession: () => set({ users: [], showEstimates: false }),
}))
