import React from "react"

import { Result } from 'antd';

// Source: Ant Design Result Component
export const Illustration404 = ({ className }: { className?: string }) => (
    <div className={className}>
        <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
        />
    </div>
)

import { Empty } from 'antd';

// Source: Ant Design Empty Component
export const IllustrationEmpty = ({ className }: { className?: string }) => (
    <div className={className}>
        <Empty description="No Data Found" />
    </div>
)

// Source: https://storyset.com/illustration/education/rafiki
export const IllustrationHome = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 800 600" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="primary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#8b5cf6", stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <rect x="100" y="100" width="600" height="400" rx="20" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        <circle cx="200" cy="200" r="50" fill="url(#primary)" opacity="0.8" />
        <rect x="300" y="180" width="300" height="20" rx="10" fill="#e2e8f0" />
        <rect x="300" y="220" width="200" height="20" rx="10" fill="#e2e8f0" />

        <rect x="150" y="350" width="100" height="100" rx="10" fill="#bfdbfe" />
        <rect x="270" y="350" width="100" height="100" rx="10" fill="#ddd6fe" />
        <rect x="390" y="350" width="100" height="100" rx="10" fill="#fecaca" />

        <circle cx="700" cy="500" r="80" fill="#f0f9ff" opacity="0.5" />
    </svg>
)
