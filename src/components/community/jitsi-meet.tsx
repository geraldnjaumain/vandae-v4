"use client"

import { Loader2 } from "lucide-react"
import { useState } from "react"

export function JitsiMeet({ roomName, displayName }: { roomName: string, displayName: string }) {
    const [isLoading, setIsLoading] = useState(true)

    // Sanitize room name to be url safe and unique enough
    const safeRoomName = `Vadea-${roomName.replace(/[^a-zA-Z0-9]/g, '-')}`

    return (
        <div className="w-full h-[65vh] rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-slate-900 z-0">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Connecting to Secure Room...</span>
                </div>
            )}
            <iframe
                src={`https://meet.jit.si/${safeRoomName}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.prejoinPageEnabled=false&interfaceConfig.SHOW_JITSI_WATERMARK=false`}
                allow="camera; microphone; display-capture; autoplay; clipboard-write"
                className="w-full h-full border-0 relative z-10"
                onLoad={() => setIsLoading(false)}
            />
        </div>
    )
}
