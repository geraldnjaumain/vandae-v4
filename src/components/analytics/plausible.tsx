"use client"

import Script from 'next/script'

export function PlausibleAnalytics() {
    // Only load in production
    if (process.env.NODE_ENV !== 'production') {
        return null
    }

    return (
        <Script
            defer
            data-domain="yourdomain.com"
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
        />
    )
}
