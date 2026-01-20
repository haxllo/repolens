'use client'

import { useState } from 'react'
import { Search, FileCode, Folder, ChevronDown, ChevronRight } from 'lucide-react'

interface FilesTabProps {
  results: any
}

export default function FilesTab({ results }: FilesTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())
  const files = results?.files || []

  const filteredFiles = files.filter((file: any) =>
    file.path.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filesByDirectory: Record<string, any[]> = {}
  filteredFiles.forEach((file: any) => {
    const parts = file.path.split('/')
    const directory = parts.length > 1 ? parts.slice(0, -1).join('/') : '/'
    if (!filesByDirectory[directory]) {
      filesByDirectory[directory] = []
    }
    filesByDirectory[directory].push(file)
  })

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-500/20 text-yellow-400',
      typescript: 'bg-blue-500/20 text-blue-400',
      python: 'bg-green-500/20 text-green-400',
      java: 'bg-red-500/20 text-red-400',
      go: 'bg-cyan-500/20 text-cyan-400',
      rust: 'bg-orange-500/20 text-orange-400',
      csharp: 'bg-purple-500/20 text-purple-400',
    }
    return colors[language.toLowerCase()] || 'bg-white/10 text-white/60'
  }

  const toggleDir = (dir: string) => {
    const newExpanded = new Set(expandedDirs)
    if (newExpanded.has(dir)) {
      newExpanded.delete(dir)
    } else {
      newExpanded.add(dir)
    }
    setExpandedDirs(newExpanded)
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="glass p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">File Explorer</h3>
            <p className="text-sm text-white/50">
              {files.length} files analyzed • {filteredFiles.length} matches
            </p>
          </div>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/[0.05] text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-lime-400/50"
          />
        </div>
      </div>

      {/* File List */}
      {Object.keys(filesByDirectory).length === 0 ? (
        <div className="glass p-12 text-center">
          <p className="text-white/50">No files found matching your search.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(filesByDirectory)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([directory, dirFiles]) => {
              const isExpanded = expandedDirs.has(directory)
              return (
                <div key={directory} className="glass">
                  <button
                    onClick={() => toggleDir(directory)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    )}
                    <Folder className="w-4 h-4 text-lime-400" />
                    <span className="font-mono text-sm flex-1 text-left">{directory}</span>
                    <span className="text-xs text-white/40">{dirFiles.length} files</span>
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t border-white/[0.05]">
                      {dirFiles.map((file: any, idx: number) => {
                        const filename = file.path.split('/').pop()
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 pl-12 hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileCode className="w-4 h-4 text-white/30 flex-shrink-0" />
                              <div className="min-w-0">
                                <code className="text-sm font-mono truncate block">{filename}</code>
                                <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                                  <span>{file.lines || 0} lines</span>
                                  {file.complexity && <span>Complexity: {file.complexity}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {file.language && (
                                <span className={`px-2 py-0.5 text-xs ${getLanguageColor(file.language)}`}>
                                  {file.language}
                                </span>
                              )}
                              {file.riskScore !== undefined && (
                                <span className={`px-2 py-0.5 text-xs ${
                                  file.riskScore >= 75 ? 'bg-red-500/20 text-red-400' :
                                  file.riskScore >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-lime-500/20 text-lime-400'
                                }`}>
                                  Risk: {Math.round(file.riskScore)}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
