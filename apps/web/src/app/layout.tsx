import type { Metadata } from 'next'
import { Instrument_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'

const instrumentSans = Instrument_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://repolens.vercel.app'),
  title: 'RepoLens | Architectural Archive',
  description: 'High-performance repository indexing and architectural diagnostic engine.',
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
      <body className={`${instrumentSans.variable} font-sans bg-black antialiased`}>
        <Providers>
          {children}
          <Toaster 
            theme="dark" 
            position="bottom-right"
            toastOptions={{
              className: 'rounded-none border border-white/10 bg-black text-white font-mono text-[10px] uppercase tracking-widest',
            }}
          />
        </Providers>
      </body>
    </html>
  )
}