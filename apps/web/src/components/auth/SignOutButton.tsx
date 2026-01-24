'use client'

import { authClient } from '@/lib/auth-client'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  return (
    <button
      onClick={async () => {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = '/auth/signin'
            }
          }
        })
      }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors w-full"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  )
}
