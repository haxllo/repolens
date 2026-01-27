'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  Bookmark,
  Box,
  BookOpen,
  Command
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface FavoriteRepository {
  id: string
  repositoryId: string
  createdAt: string
  repository: {
    id: string
    name: string
    owner: string
    url: string
    latestScanId?: string
    latestScanAt?: string
  }
}

export default function FavoritesPage() {
  const { data: session } = authClient.useSession()
  const [favorites, setFavorites] = useState<FavoriteRepository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<FavoriteRepository[]>('/favorites')
      setFavorites(data)
    } catch {
      setError('Index synchronization failed.')
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (repositoryId: string) => {
    try {
      await apiClient.delete(`/favorites/${repositoryId}`)
      setFavorites(favorites.filter(f => f.repositoryId !== repositoryId))
    } catch {
      console.error('Record erasure failed.')
    }
  }

  if (!session) return null

  return (
    <div className="space-y-16 max-w-6xl mx-auto">
      {/* Vault Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 text-mono">Core_Index_Protocol</h2>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none italic">Verified Archives</h1>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest tabular-nums">
            Vault_Count: {favorites.length} Entries
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-px bg-white/5 border border-white/5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-black p-12 h-32 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-12 border border-red-500/20 bg-black text-center space-y-6">
          <AlertCircle className="w-10 h-10 text-red-500/20 mx-auto" />
          <p className="text-xs font-mono text-red-400 uppercase tracking-widest">{error}</p>
          <button onClick={fetchFavorites} className="text-[10px] font-black uppercase tracking-[0.3em] text-white hover:text-lime-400 transition-colors">
            Re-Initialize Vault
          </button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-32 border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-6">
          <Bookmark className="w-10 h-10 text-white/5" />
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/20">Archive Vault Empty</h3>
            <Link href="/dashboard" className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-lime-400">
              Begin Architectural Indexing
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-px bg-white/5 border border-white/5">
          {favorites.map((fav) => (
            <div key={fav.id} className="group bg-black p-10 hover:bg-white/[0.01] transition-all relative">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
                
                {/* Identifier Section */}
                <div className="flex items-center gap-10 min-w-0">
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="w-1 h-12 bg-white/5 group-hover:bg-lime-400 transition-colors duration-700" />
                    <span className="text-[8px] font-black font-mono text-white/10 group-hover:text-white/30 tracking-tighter">0{fav.id.slice(0,1)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white group-hover:text-lime-400 transition-colors truncate">
                        {fav.repository.name}
                      </span>
                      <a href={fav.repository.url} target="_blank" rel="noopener noreferrer" className="text-white/10 hover:text-white transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <span className="text-white/5">ORIGIN:</span> {fav.repository.owner}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/5">ARCHIVE_ID:</span> {fav.repository.id.slice(0, 12)}
                      </div>
                      {fav.repository.latestScanAt && (
                        <div className="flex items-center gap-2">
                          <span className="text-white/5">LAST_SYNC:</span> {new Date(fav.repository.latestScanAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Entry Protocols */}
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  {fav.repository.latestScanId ? (
                    <div className="flex items-center gap-px bg-white/5 border border-white/5 p-1 w-full lg:w-auto">
                      <Link 
                        href={`/dashboard/${fav.repository.latestScanId}`} 
                        className="flex-1 lg:flex-none flex items-center gap-3 px-6 py-3 bg-black hover:bg-white/[0.05] border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all group/btn"
                      >
                        <BookOpen className="w-3 h-3 text-white/20 group-hover/btn:text-lime-400" />
                        Wiki
                      </Link>
                      <Link 
                        href={`/dashboard/${fav.repository.latestScanId}?view=spatial`} 
                        className="flex-1 lg:flex-none flex items-center gap-3 px-6 py-3 bg-black hover:bg-white/[0.05] border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all group/btn"
                      >
                        <Box className="w-3 h-3 text-white/20 group-hover/btn:text-lime-400" />
                        Map
                      </Link>
                    </div>
                  ) : (
                    <Link 
                      href="/dashboard" 
                      className="flex items-center gap-3 px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-lime-400 transition-all active:scale-95"
                    >
                      <Command className="w-3.5 h-3.5" />
                      Sync Record
                    </Link>
                  )}
                  
                  <button
                    onClick={() => removeFavorite(fav.repositoryId)}
                    className="p-4 border border-white/5 text-white/10 hover:text-red-500 hover:border-red-500/20 transition-all ml-4"
                    title="Erase Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aesthetic Accents */}
      <div className="flex items-center justify-between pt-12 border-t border-white/5 text-[9px] font-mono text-white/10 uppercase tracking-[0.5em]">
        <span>Index_Terminal // Archive_Safety_Protocol</span>
        <div className="flex gap-8">
           <div className="flex items-center gap-3">
              <div className="w-1 h-1 bg-lime-400" />
              <span className="text-white/20">Verified</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-1 h-1 bg-white/10" />
              <span className="text-white/20">Restricted</span>
           </div>
        </div>
      </div>
    </div>
  )
}
