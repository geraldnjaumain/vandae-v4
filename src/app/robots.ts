import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/settings/',
          '/notifications/',
          '/inbox/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: 'https://vadea.app/sitemap.xml',
  }
}
