'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface HUDCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  action?: React.ReactNode
  noPadding?: boolean
  variant?: 'default' | 'subtle' | 'accent'
}

export function HUDCard({ 
  children, 
  className, 
  title, 
  action, 
  noPadding = false, 
  variant = 'default',
  ...props 
}: HUDCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "relative group bg-black/40 backdrop-blur-sm border border-white/5",
        variant === 'accent' && "border-lime-400/20",
        className
      )} 
      {...props}
    >
      {/* Corner Brackets - Refined */}
      <div className="absolute top-[-1px] left-[-1px] w-6 h-6 border-l border-t border-white/20 group-hover:border-lime-400/60 transition-colors duration-500 z-10" />
      <div className="absolute top-[-1px] right-[-1px] w-6 h-6 border-r border-t border-white/20 group-hover:border-lime-400/60 transition-colors duration-500 z-10" />
      <div className="absolute bottom-[-1px] left-[-1px] w-6 h-6 border-l border-b border-white/20 group-hover:border-lime-400/60 transition-colors duration-500 z-10" />
      <div className="absolute bottom-[-1px] right-[-1px] w-6 h-6 border-r border-b border-white/20 group-hover:border-lime-400/60 transition-colors duration-500 z-10" />

      {/* Internal Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_50%_0%,rgba(163,230,53,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Header */}
      {(title || action) && (
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]">
          {title && (
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-1.5 bg-lime-400" 
              />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 group-hover:text-white transition-colors">
                {title}
              </h3>
            </div>
          )}
          {action && (
            <div className="relative z-20">
              {action}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn("relative z-10", !noPadding && "p-8")}>
        {children}
      </div>

      {/* Footer Decoration (Technical Detail) */}
      <div className="absolute bottom-1 right-8 flex gap-1 opacity-20 pointer-events-none">
        <div className="w-1 h-1 bg-white" />
        <div className="w-4 h-[1px] bg-white self-center" />
      </div>
    </motion.div>
  )
}