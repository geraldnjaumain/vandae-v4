export function VadeaLogo({ className = "h-8 w-8" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Book/Document icon - flat design */}
            <rect
                x="20"
                y="15"
                width="60"
                height="70"
                rx="4"
                fill="#3B82F6"
            />
            {/* Page lines */}
            <rect x="30" y="30" width="40" height="3" rx="1.5" fill="white" opacity="0.9" />
            <rect x="30" y="40" width="35" height="3" rx="1.5" fill="white" opacity="0.9" />
            <rect x="30" y="50" width="38" height="3" rx="1.5" fill="white" opacity="0.9" />
            <rect x="30" y="60" width="32" height="3" rx="1.5" fill="white" opacity="0.9" />
            {/* Bookmark accent */}
            <path
                d="M 70 15 L 70 45 L 65 40 L 60 45 L 60 15 Z"
                fill="#10B981"
            />
        </svg>
    )
}

export function VadeaLogoWithText({ className = "h-8", textClassName = "text-foreground" }: { className?: string; textClassName?: string }) {
    return (
        <div className="flex items-center gap-3">
            <VadeaLogo className="h-8 w-8" />
            <span className={`text-xl font-bold ${textClassName}`}>
                Vadea
            </span>
        </div>
    )
}
