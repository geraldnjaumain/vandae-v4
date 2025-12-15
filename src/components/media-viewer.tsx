"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Download, ExternalLink, ZoomIn, ZoomOut } from "lucide-react"
import { useMediaViewer } from "@/lib/stores/media-viewer-store"
import { motion, AnimatePresence } from "framer-motion"

export function MediaViewer() {
    const { isOpen, url, type, fileName, close } = useMediaViewer()
    const [scale, setScale] = React.useState(1)

    React.useEffect(() => {
        if (!isOpen) setScale(1)
    }, [isOpen])

    if (!url) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    {/* Toolbar */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-6 z-50 pointer-events-none"
                    >
                        <div className="flex items-center gap-3 pointer-events-auto">
                            <span className="text-white font-medium text-sm truncate max-w-[200px] md:max-w-md">
                                {fileName}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 pointer-events-auto">
                            {type === 'image' && (
                                <>
                                    <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="text-white hover:bg-white/10">
                                        <ZoomOut className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(3, s + 0.25))} className="text-white hover:bg-white/10">
                                        <ZoomIn className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                            <a href={url} download={fileName} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </a>
                            <Button variant="ghost" size="icon" onClick={close} className="text-white hover:bg-white/10">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full h-full flex items-center justify-center p-4 md:p-10 overflow-hidden"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) close();
                        }}
                    >
                        {type === 'image' && (
                            <div className="relative overflow-auto flex items-center justify-center w-full h-full" style={{ touchAction: 'none' }}>
                                <motion.img
                                    src={url}
                                    alt={fileName}
                                    style={{ scale }}
                                    className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                                    drag
                                    dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                                />
                            </div>
                        )}

                        {type === 'video' && (
                            <video controls autoPlay className="max-w-full max-h-full rounded-md shadow-2xl">
                                <source src={url} />
                                Your browser does not support the video tag.
                            </video>
                        )}

                        {type === 'pdf' && (
                            <iframe src={url} className="w-full h-full max-w-5xl rounded-md shadow-2xl bg-white" />
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
