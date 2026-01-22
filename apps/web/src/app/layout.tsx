import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://repolens.vercel.app'),
  title: 'RepoLens - Understand Any Repository in Minutes',
  description: 'AI-powered repository analysis tool with 3D dependency visualization. Get deep insights, architecture summaries, and code quality metrics instantly.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://repolens.vercel.app',
    siteName: 'RepoLens',
    title: 'RepoLens - Understand Any Repository in Minutes',
    description: 'AI-powered repository analysis tool with 3D dependency visualization. Get deep insights, architecture summaries, and code quality metrics instantly.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RepoLens Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RepoLens - Understand Any Repository in Minutes',
    description: 'AI-powered repository analysis tool with 3D dependency visualization.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
