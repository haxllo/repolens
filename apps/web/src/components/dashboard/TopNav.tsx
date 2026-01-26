'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Layers, 
  Terminal,
  History, 
  Star, 
  User, 
  LogOut,
  Cpu,
  Search,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export function TopNav({ user }: { user: any }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Console', icon: Terminal },
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 h-16 flex items-center justify-between select-none">
      {/* Scanning Line Effect */}
      <motion.div 
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-1px] left-0 w-1/4 h-[1px] bg-gradient-to-r from-transparent via-lime-400/50 to-transparent z-10"
      />

      {/* Left: Brand & Context */}
      <div className="flex h-full">
        <Link href="/" className="flex items-center gap-4 px-8 h-full border-r border-white/10 hover:bg-white/[0.02] transition-colors group relative overflow-hidden">
          <div className="w-6 h-6 bg-white flex items-center justify-center group-hover:bg-lime-400 transition-colors duration-500">
            <Layers className="w-3.5 h-3.5 text-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-black text-white tracking-[0.3em] uppercase">RepoLens</span>
            <span className="text-[8px] font-mono text-white/30 tracking-widest uppercase">Diagnostic_Engine</span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </Link>
        
        {/* Breadcrumb / Context Indicator */}
        <div className="hidden lg:flex items-center px-8 h-full border-r border-white/10 gap-6">
          <div className="flex items-center gap-3">
            <Activity className="w-3.5 h-3.5 text-lime-400 animate-pulse" />
            <span className="text-[9px] font-mono text-white/60 uppercase tracking-widest tabular-nums">
              Core_Active
            </span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[7px] font-mono text-white/20 uppercase tracking-[0.2em] mb-1">Location</span>
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest truncate max-w-[120px]">
              {pathname.replace('/', '').replace(/\//g, ' > ') || 'Root'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Navigation Links */}
      <div className="flex h-full items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "h-full flex flex-col items-center justify-center px-10 border-l border-white/5 transition-all relative overflow-hidden group",
                isActive 
                  ? "text-lime-400 bg-lime-400/[0.02]" 
                  : "text-white/30 hover:text-white hover:bg-white/[0.02]"
              )}
            >
              <item.icon className={cn("w-4 h-4 mb-2 transition-transform duration-500 group-hover:-translate-y-1", isActive ? "text-lime-400" : "text-white/20 group-hover:text-white")} />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">{item.label}</span>
              
              {isActive && (
                <motion.div 
                  layoutId="nav-active"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)]" 
                />
              )}
            </Link>
          )
        })}
      </div>

      {/* Right: Search & User Profile */}
      <div className="flex h-full">
        {/* Mini Search Trigger */}
        <button className="flex items-center justify-center w-16 h-full border-l border-white/10 hover:bg-white/[0.02] text-white/40 hover:text-white transition-all group">
          <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        {/* User Segment */}
        <div className="flex items-center px-8 h-full border-l border-white/10 gap-5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors cursor-pointer group">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-none mb-1 group-hover:text-lime-400 transition-colors">
              {user.name || 'Operator'}
            </span>
            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest leading-none">
              Role: Admin
            </span>
          </div>
          <div className="relative">
            <div className="w-10 h-10 bg-black border border-white/10 flex items-center justify-center group-hover:border-lime-400 transition-colors duration-500">
              <User className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
            </div>
            <div className="absolute top-0 right-0 w-2 h-2 bg-lime-400 border border-black animate-pulse" />
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleSignOut}
          className="flex items-center justify-center w-16 h-full border-l border-white/10 hover:bg-red-500/10 hover:text-red-500 text-white/20 transition-all"
          title="Terminate Session"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  )
}
