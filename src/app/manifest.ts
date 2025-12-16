export default function manifest() {
    return {
        name: 'Vadea - Academic Planner',
        short_name: 'Vadea',
        description: 'Smart academic planner and productivity platform for students',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4F46E5',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
