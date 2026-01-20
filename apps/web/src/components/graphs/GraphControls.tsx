'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface GraphControlsProps {
  languages: string[]
  onFilterChange?: (filters: GraphFilters) => void
}

export interface GraphFilters {
  searchTerm: string
  selectedLanguages: string[]
}

export default function GraphControls({ languages, onFilterChange }: GraphControlsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    onFilterChange?.({ searchTerm: value, selectedLanguages })
  }

  const toggleLanguage = (language: string) => {
    const newSelection = selectedLanguages.includes(language)
      ? selectedLanguages.filter((l) => l !== language)
      : [...selectedLanguages, language]

    setSelectedLanguages(newSelection)
    onFilterChange?.({ searchTerm, selectedLanguages: newSelection })
  }

  return (
    <div className="glass p-4 space-y-4">
      <h4 className="font-medium">Graph Controls</h4>
      
      {/* Search */}
      <div className="space-y-2">
        <label className="text-xs text-white/50">Search Files</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Filter by filename..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/[0.05] text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-lime-400/50"
          />
        </div>
      </div>

      {/* Language Filters */}
      {languages.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs text-white/50">Filter by Language</label>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`px-2 py-1 text-xs transition-colors ${
                  selectedLanguages.includes(lang)
                    ? 'bg-lime-400 text-black'
                    : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.08]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="pt-4 border-t border-white/10 text-xs text-white/40 space-y-2">
        <p className="font-medium text-white/60">Controls:</p>
        <ul className="space-y-1">
          <li>• Click and drag to rotate</li>
          <li>• Scroll to zoom in/out</li>
          <li>• Click nodes for details</li>
        </ul>
      </div>
    </div>
  )
}
