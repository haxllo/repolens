'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Layers, 
  LayoutDashboard, 
  History, 
  Star, 
  User, 
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'

export function TopNav({ user }: { user: any }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Console', icon: LayoutDashboard },
    { href: '/dashboard/history', label: 'Archives', icon: History },
    { href: '/dashboard/favorites', label: 'Bookmarks', icon: Star },
  ]

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success('Session terminated.')
          window.location.href = '/'
        }
      }
    })
  }

  return (
    <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-black border border-white/10 rounded-none flex items-center gap-8 shadow-2xl">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 pr-8 border-r border-white/10 group">
        <div className="w-6 h-6 bg-white flex items-center justify-center group-hover:bg-lime-400 transition-colors">
          <Layers className="w-4 h-4 text-black" />
        </div>
        <span className="text-[11px] font-black text-white tracking-[0.2em] uppercase">RepoLens</span>
      </Link>

      {/* Nav Items */}
      <div className="flex items-center gap-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                isActive ? "text-lime-400" : "text-white/30 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* User / Logout */}
      <div className="flex items-center gap-6 pl-8 border-l border-white/10 text-white/20">
        <div className="flex items-center gap-3">
            <User className="w-3 h-3" />
            <span className="text-[10px] font-mono lowercase tracking-tighter truncate max-w-[100px]">{user.email?.split('@')[0]}</span>
        </div>
        <button 
            onClick={handleSignOut}
            className="hover:text-red-500 transition-colors"
            title="Terminate Session"
        >
            <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </nav>
  )
}
