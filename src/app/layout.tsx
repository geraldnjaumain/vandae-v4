import type { Metadata } from "next";
import { Inter } from "next/font/google"
import "./globals.css";
import { Toaster } from "sonner";
import { MediaViewer } from "@/components/media-viewer";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://vadea.app'),
  title: {
    default: 'Vadea - Smart Academic Planner for Students',
    template: '%s | Vadea'
  },
  description: 'Vadea is the ultimate academic planner and productivity platform for students. Organize your classes, assignments, study materials, and collaborate with classmates - all in one place.',
  keywords: [
    'academic planner',
    'student productivity',
    'assignment tracker',
    'study planner',
    'class schedule',
    'student organization',
    'school planner',
    'college planner',
    'study materials',
    'flashcards',
    'spaced repetition',
    'student collaboration',
    'time management',
    'educational tools',
    'study groups'
  ],
  authors: [{ name: 'Vadea Team' }],
  creator: 'Vadea',
  publisher: 'Vadea',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vadae.com',
    title: 'Vadae | The Student OS',
    description: 'Organize your academic life with AI. Timetables, notes, and community—all in one place.',
    siteName: 'Vadae',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vadae - Your Academic Second Brain',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vadae | The Student OS',
    description: 'Organize your academic life with AI. Timetables, notes, and community.',
    images: ['/og-image.png'],
    creator: '@vadae',
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://vadea.app/#organization',
        name: 'Vadea',
        url: 'https://vadea.app',
        logo: {
          '@type': 'ImageObject',
          url: 'https://vadea.app/logo.png',
        },
        sameAs: [
          'https://twitter.com/vadea_app',
          'https://linkedin.com/company/vadea',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://vadea.app/#website',
        url: 'https://vadea.app',
        name: 'Vadea',
        description: 'Smart academic planner and productivity platform for students',
        publisher: {
          '@id': 'https://vadea.app/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://vadea.app/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Vadea',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '1250',
        },
      },
    ],
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <MediaViewer />
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
