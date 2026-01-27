'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'

export function TopNav({ user }: { user: any }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Console' },
    { href: '/dashboard/history', label: 'History' },
    { href: '/dashboard/favorites', label: 'Vault' },
  ]

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success('SESSION_TERMINATED', { className: 'font-mono text-[10px]' })
          window.location.href = '/'
        }
      }
    })
  }

  return (
    <header className="fixed top-0 z-50 w-full h-12 bg-black border-b border-white/10 px-6 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-3 group">
          <Image 
            src="/LOGO.svg" 
            alt="RepoLens" 
            width={12} 
            height={16} 
            className="group-hover:opacity-100 opacity-70 transition-opacity" 
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground">RepoLens</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-mono text-[10px] uppercase tracking-widest transition-colors",
                pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 suppress">
          <Activity className="w-3 h-3 text-primary animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-widest">{user.email.split('@')[0]}</span>
        </div>
        
        <div className="w-[1px] h-4 bg-white/10" />
        
        <button 
          onClick={handleSignOut} 
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          Term_Session [×]
        </button>
      </div>
    </header>
  )
}
