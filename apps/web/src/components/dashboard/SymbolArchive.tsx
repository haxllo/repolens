'use client'

import React, { useState, useMemo } from 'react'
import { Search, Code2, Cpu, Hash, ExternalLink, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Symbol {
  name: String
  kind: string
  references: number
  cyclomatic: number
  cognitive: number
}

interface FileData {
  path: string
  symbols: Symbol[]
}

interface SymbolArchiveProps {
  data: {
    ast?: {
      files: FileData[]
    }
  }
}

export function SymbolArchive({ data }: SymbolArchiveProps) {
  const [search, setSearch] = useState('')
  
  const allSymbols = useMemo(() => {
    const symbols: any[] = []
    data?.ast?.files?.forEach(file => {
      file.symbols?.forEach(sym => {
        symbols.push({
          ...sym,
          path: file.path
        })
      })
    })
    return symbols.sort((a, b) => b.references - a.references)
  }, [data])

  const filteredSymbols = useMemo(() => {
    if (!search) return allSymbols
    const lowerSearch = search.toLowerCase()
    return allSymbols.filter(s => 
      s.name.toLowerCase().includes(lowerSearch) || 
      s.path.toLowerCase().includes(lowerSearch)
    )
  }, [allSymbols, search])

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HUD Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/[0.02] border border-white/5 p-6">
        <div className="flex items-center gap-4 text-white/40">
          <Hash className="w-4 h-4 text-lime-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Symbol_Registry_v1.0</span>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <input 
            type="text"
            placeholder="FILTER_BY_NAME_OR_PATH..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-white/10 px-12 py-3 text-[10px] font-mono text-white placeholder:text-white/10 uppercase tracking-widest focus:outline-none focus:border-lime-400/50 transition-colors"
          />
        </div>
      </div>

      {/* Grid of Results */}
      <div className="border border-white/5 bg-black overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Symbol</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Path</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Refs</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Complexity</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Kind</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredSymbols.slice(0, 50).map((sym, i) => (
              <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Code2 className="w-3.5 h-3.5 text-white/20 group-hover:text-lime-400 transition-colors" />
                    <span className="text-[11px] font-mono font-bold text-white/80">{sym.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-mono text-white/30 truncate max-w-xs block uppercase">{sym.path}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-mono text-lime-400/60 tabular-nums font-bold">{sym.references}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-white/10 uppercase font-black">Cyc</span>
                      <span className={cn(
                        "text-[10px] font-mono tabular-nums",
                        sym.cyclomatic > 10 ? "text-red-500" : "text-white/40"
                      )}>{sym.cyclomatic}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-white/10 uppercase font-black">Cog</span>
                      <span className={cn(
                        "text-[10px] font-mono tabular-nums",
                        sym.cognitive > 15 ? "text-orange-500" : "text-white/40"
                      )}>{sym.cognitive}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2 py-0.5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/20 group-hover:text-white group-hover:border-white/20 transition-all">
                    {sym.kind}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSymbols.length === 0 && (
          <div className="py-24 text-center">
            <Cpu className="w-8 h-8 text-white/5 mx-auto mb-4" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/10">No matching symbols in registry.</span>
          </div>
        )}
      </div>
    </div>
  )
}
