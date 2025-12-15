import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AIStore {
    activeFileIds: string[]
    toggleFile: (id: string) => void
    clearFiles: () => void
    isAttached: (id: string) => boolean
}

export const useAIStore = create<AIStore>()(
    persist(
        (set, get) => ({
            activeFileIds: [],
            toggleFile: (id) => set((state) => {
                const isAttached = state.activeFileIds.includes(id)
                return {
                    activeFileIds: isAttached
                        ? state.activeFileIds.filter((fid) => fid !== id)
                        : [...state.activeFileIds, id]
                }
            }),
            clearFiles: () => set({ activeFileIds: [] }),
            isAttached: (id) => get().activeFileIds.includes(id)
        }),
        {
            name: 'vadea-ai-store',
        }
    )
)
