import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://repolens.vercel.app'),
  title: 'RepoLens | Architectural Archive',
  description: 'High-performance repository indexing and architectural diagnostic engine.',
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-black antialiased selection:bg-primary selection:text-white`}>
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
