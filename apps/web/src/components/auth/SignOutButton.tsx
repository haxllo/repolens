'use client'

import { authClient } from '@/lib/auth-client'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SignOutButton({ collapsed }: { collapsed?: boolean }) {
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
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors w-full",
        collapsed && "justify-center px-0 h-10 w-10 hover:bg-red-500/10 hover:text-red-400"
      )}
      title={collapsed ? "Sign out" : undefined}
    >
      <LogOut className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span>Sign out</span>}
    </button>
  )
}
