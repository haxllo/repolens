'use client'

import React from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from './button'
import Link from 'next/link'

interface TechnicalErrorProps {
  error?: Error | string
  reset?: () => void
}

export function TechnicalError({ error, reset }: TechnicalErrorProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred.'

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-3 bg-destructive/10 rounded-full">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-muted-foreground text-sm">{errorMessage}</p>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          {reset && (
            <Button onClick={reset} variant="default" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try again
            </Button>
          )}
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}