import * as React from "react"

export function CustomAIIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 512 512"
            fill="currentColor"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M256 0 C 256 0, 310 180, 512 256 C 310 332, 256 512, 256 512 C 256 512, 202 332, 0 256 C 202 180, 256 0, 256 0 Z" />
        </svg>
    )
}
