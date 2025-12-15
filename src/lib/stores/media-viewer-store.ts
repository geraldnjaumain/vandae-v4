
import { create } from 'zustand'

type MediaType = 'image' | 'video' | 'pdf'

interface MediaViewerState {
    isOpen: boolean
    url: string | null
    type: MediaType
    fileName: string
    open: (url: string, fileName?: string) => void
    close: () => void
}

export const useMediaViewer = create<MediaViewerState>((set) => ({
    isOpen: false,
    url: null,
    type: 'image',
    fileName: '',
    open: (url, fileName = 'File') => {
        const extension = url.split('.').pop()?.toLowerCase()
        let type: MediaType = 'image'

        if (['mp4', 'webm', 'ogg'].includes(extension || '')) {
            type = 'video'
        } else if (['pdf'].includes(extension || '')) {
            type = 'pdf'
        }

        set({ isOpen: true, url, type, fileName })
    },
    close: () => set({ isOpen: false, url: null })
}))
