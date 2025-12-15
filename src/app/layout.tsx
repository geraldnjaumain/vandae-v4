import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { MediaViewer } from "@/components/media-viewer";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vadae.com'),
  title: {
    default: 'Vadea | The Student OS',
    template: '%s | Vadea'
  },
  description: 'Organize your academic life with AI. Timetables, notes, and community—all in one place.',
  keywords: ['student', 'organization', 'timetable', 'AI', 'study', 'notes', 'community', 'university', 'college'],
  authors: [{ name: 'Vadae Team' }],
  creator: 'Vadae',
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
