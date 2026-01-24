'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Zap, 
  LayoutDashboard, 
  History, 
  Star, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Menu
} from 'lucide-react'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { cn } from '@/lib/utils'

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function Sidebar({ user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/history', label: 'History', icon: History },
    { href: '/dashboard/favorites', label: 'Favorites', icon: Star },
  ]

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 80 }
  }

  return (
    <>
      {/* Mobile Toggle */}
      {isMobile && (
        <button 
          onClick={() => setIsMobileOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-background border border-white/10 rounded-lg text-white/70"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isMobile ? (isOpen ? "expanded" : "collapsed") : (isCollapsed ? "collapsed" : "expanded")}
        variants={sidebarVariants}
        className={cn(
          "fixed inset-y-0 left-0 z-40 lg:relative border-r border-white/[0.06] bg-background flex flex-col transition-all duration-300",
          isMobile && !isOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 overflow-hidden flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-black" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold text-lg text-white whitespace-nowrap"
              >
                RepoLens
              </motion.span>
            )}
          </Link>
          
          {!isMobile && (
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative group",
                  isActive 
                    ? "text-lime-400 bg-lime-400/5 border border-lime-400/10" 
                    : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-lime-400" : "text-white/40 group-hover:text-white")} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-white text-black text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className={cn(
            "glass rounded-xl p-4 transition-all",
            isCollapsed && "p-2 items-center flex flex-col gap-4"
          )}>
            <div className={cn("flex items-center gap-3", isCollapsed && "flex-col")}>
              <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0 border border-white/5">
                <User className="h-5 w-5 text-white/50" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-medium truncate text-white">{user.name || 'User'}</p>
                  <p className="text-xs text-white/40 truncate">{user.email}</p>
                </div>
              )}
            </div>
            
            <div className={cn("mt-3", isCollapsed && "mt-0")}>
              <SignOutButton collapsed={isCollapsed} />
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
