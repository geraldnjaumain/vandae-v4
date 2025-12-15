export function VadeaLogo({ className = "h-8 w-8" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#9333EA" />
                </linearGradient>
                <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="0" dy="2" result="offsetblur" />
                    <feFlood floodColor="#000000" floodOpacity="0.2" />
                    <feComposite in2="offsetblur" operator="in" />
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Outer Circle */}
            <circle
                cx="50"
                cy="50"
                r="45"
                fill="url(#logoGradient)"
                filter="url(#logoShadow)"
                opacity="0.1"
            />

            {/* Main V Shape with Neural Network Theme */}
            <g filter="url(#logoShadow)">
                {/* Left side of V */}
                <path
                    d="M 25 25 L 50 70 L 50 65 L 30 25 Z"
                    fill="url(#logoGradient)"
                />
                {/* Right side of V */}
                <path
                    d="M 75 25 L 50 70 L 50 65 L 70 25 Z"
                    fill="url(#logoGradient)"
                />

                {/* Neural nodes */}
                <circle cx="25" cy="25" r="4" fill="#4F46E5" />
                <circle cx="75" cy="25" r="4" fill="#9333EA" />
                <circle cx="50" cy="70" r="5" fill="url(#logoGradient)" />

                {/* Connecting lines (synapses) */}
                <line x1="25" y1="25" x2="40" y2="40" stroke="url(#logoGradient)" strokeWidth="1.5" opacity="0.6" />
                <line x1="75" y1="25" x2="60" y2="40" stroke="url(#logoGradient)" strokeWidth="1.5" opacity="0.6" />

                {/* Knowledge beam effect */}
                <path
                    d="M 50 15 L 45 25 L 55 25 Z"
                    fill="url(#logoGradient)"
                    opacity="0.8"
                />
            </g>
        </svg>
    )
}

export function VadeaLogoWithText({ className = "h-8" }: { className?: string }) {
    return (
        <div className="flex items-center gap-3">
            <VadeaLogo className="h-8 w-8" />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Vadea
            </span>
        </div>
    )
}
