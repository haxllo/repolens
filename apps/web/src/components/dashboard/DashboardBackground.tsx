'use client'

import { motion, useScroll, useTransform } from 'motion/react'

export function DashboardBackground() {
  const { scrollY } = useScroll()
  
  // As user scrolls down (from 0 to 500px), opacity goes from 1 to 0
  const opacity = useTransform(scrollY, [0, 500], [1, 0])
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:60px_60px] opacity-[0.15]" />
      
      {/* The "Ball" in the back */}
      <motion.div 
        style={{ opacity }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-lime-400/[0.08] rounded-full blur-[120px]" 
      />
      
      <motion.div 
        style={{ opacity: useTransform(scrollY, [0, 800], [0.5, 0]) }}
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[100px]" 
      />
    </div>
  )
}
