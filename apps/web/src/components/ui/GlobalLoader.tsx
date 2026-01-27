'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}