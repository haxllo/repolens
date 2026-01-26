'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Terminal, ShieldAlert } from 'lucide-react'
import { Button } from './button'
import Link from 'next/link'

interface TechnicalErrorProps {
  error?: Error | string
  reset?: () => void
}

export function TechnicalError({ error, reset }: TechnicalErrorProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown system fault'
  const stack = typeof error === 'object' ? error?.stack : null

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500/20" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full relative z-10"
      >
        {/* Error Header */}
        <div className="bg-red-500/10 border border-red-500/30 p-10 mb-8 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full" />
            
            <div className="flex items-start gap-8 relative z-10">
                <div className="w-16 h-16 border-2 border-red-500 flex items-center justify-center bg-black shrink-0">
                    <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
                </div>
                <div>
                    <span className="text-[10px] font-black text-red-500 tracking-[0.4em] uppercase mb-4 block">System_Interrupt_Signal</span>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-none">Execution_Fault</h1>
                    <p className="text-red-500/60 font-mono text-xs uppercase tracking-widest leading-relaxed">
                        The diagnostic engine has encountered a non-recoverable exception in the core runtime.
                    </p>
                </div>
            </div>
        </div>

        {/* Diagnostic Report */}
        <div className="border border-white/10 bg-white/[0.02] p-8 mb-10">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <Terminal className="w-3.5 h-3.5 text-white/20" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Diagnostic_Log</span>
                </div>
                <span className="text-[8px] font-mono text-white/10 uppercase">Ref_ID: ERR_{Math.random().toString(36).slice(2, 8).toUpperCase()}</span>
            </div>
            
            <div className="space-y-6">
                <div className="space-y-2">
                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Message</span>
                    <div className="bg-black border border-white/5 p-4 font-mono text-[11px] text-red-400/80 break-all leading-relaxed">
                        {errorMessage}
                    </div>
                </div>

                {stack && (
                    <div className="space-y-2">
                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Stack_Trace</span>
                        <div className="bg-black border border-white/5 p-4 font-mono text-[10px] text-white/20 h-32 overflow-auto custom-scrollbar leading-relaxed">
                            {stack}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Recovery Options */}
        <div className="flex flex-col md:flex-row gap-4">
            {reset && (
                <Button 
                    onClick={reset}
                    className="flex-1 h-14 bg-white text-black hover:bg-lime-400 rounded-none uppercase font-black tracking-[0.3em] text-[10px] group"
                >
                    <RefreshCw className="w-4 h-4 mr-3 group-hover:rotate-180 transition-transform duration-700" />
                    Attempt_Reboot
                </Button>
            )}
            <Link href="/" className="flex-1">
                <Button 
                    variant="outline"
                    className="w-full h-14 border-white/10 text-white hover:bg-white/5 rounded-none uppercase font-black tracking-[0.3em] text-[10px] group"
                >
                    <Home className="w-4 h-4 mr-3 group-hover:-translate-y-1 transition-transform" />
                    Return_to_Base
                </Button>
            </Link>
        </div>

        {/* Technical Footer */}
        <div className="mt-12 flex items-center justify-center gap-8 opacity-20">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[8px] font-mono uppercase tracking-[0.5em]">System_Integrity_Offline</span>
            <div className="h-px flex-1 bg-white/10" />
        </div>
      </motion.div>
    </div>
  )
}
