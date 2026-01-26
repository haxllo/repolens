'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Layers, Cpu, Shield, Zap } from 'lucide-react'

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(163,230,53,0.05)_0%,transparent_50%)]" />

      {/* Central Animation */}
      <div className="relative">
        {/* Orbiting Elements */}
        {[Cpu, Shield, Zap].map((Icon, i) => (
            <motion.div
                key={i}
                animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                }}
                transition={{ 
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }
                }}
                style={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '120px',
                    height: '120px',
                    marginLeft: '-60px',
                    marginTop: '-60px',
                    transformOrigin: 'center center'
                }}
                className="flex items-center justify-center"
            >
                <div 
                    style={{ transform: `rotate(${i * 120}deg) translateY(-80px) rotate(-${i * 120}deg)` }}
                    className="w-10 h-10 border border-white/10 bg-black flex items-center justify-center"
                >
                    <Icon className="w-4 h-4 text-white/40" />
                </div>
            </motion.div>
        ))}

        {/* Main Core */}
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-white flex items-center justify-center relative z-10"
        >
            <Layers className="w-10 h-10 text-black" />
            <motion.div 
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white" 
            />
        </motion.div>
      </div>

      {/* Loading Text & Progress */}
      <div className="mt-32 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-lime-400 tracking-[0.8em] uppercase animate-pulse">Initializing_Core</span>
            <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.3em]">Protocol_Handshake_Active</span>
        </div>
        
        <div className="w-64 h-[2px] bg-white/5 relative overflow-hidden">
            <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-y-0 w-1/3 bg-lime-400" 
            />
        </div>

        <div className="grid grid-cols-3 gap-12 mt-8 opacity-20">
            {[
                { label: 'AST_SCAN', val: '01' },
                { label: 'NEURAL_LINK', val: '02' },
                { label: 'ARCHIVE_SYNC', val: '03' }
            ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                    <span className="text-[7px] font-mono uppercase tracking-widest">{item.label}</span>
                    <span className="text-[10px] font-black">{item.val}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}
