'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, GitBranch, Clock, Trash2, ExternalLink, AlertCircle, Bookmark } from 'lucide-react'
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
    } catch (err) {
      setError('Failed to synchronize bookmarks.')
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (repositoryId: string) => {
    try {
      await apiClient.delete(`/favorites/${repositoryId}`)
      setFavorites(favorites.filter(f => f.repositoryId !== repositoryId))
    } catch (err) {
      console.error('Bookmark removal failed:', err)
    }
  }

  if (!session) return null

  return (
    <div className="space-y-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Saved Constructs</h2>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">Bookmarked Archives</h1>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest tabular-nums">
            Total Saved: {favorites.length}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-black p-12 h-48 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-12 border border-red-500/20 bg-black text-center space-y-6">
          <AlertCircle className="w-10 h-10 text-red-500/20 mx-auto" />
          <p className="text-xs font-mono text-red-400 uppercase tracking-widest">{error}</p>
          <button onClick={fetchFavorites} className="text-[10px] font-black uppercase tracking-[0.3em] text-white hover:text-lime-400 transition-colors">
            Reload Index
          </button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-32 border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-6">
          <Bookmark className="w-10 h-10 text-white/5" />
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/20">No Favorites Synced</h3>
            <Link href="/dashboard" className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-lime-400">
              Explore Repositories
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
          {favorites.map((fav) => (
            <div key={fav.id} className="group bg-black p-10 hover:bg-white/[0.02] transition-all relative">
              <div className="flex items-start justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-lime-400" />
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white truncate max-w-[200px]">
                    {fav.repository.name}
                  </h3>
                </div>
                <button
                  onClick={() => removeFavorite(fav.repositoryId)}
                  className="text-white/20 hover:text-red-500 transition-colors"
                  title="Erase Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 mb-12">
                <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-white/10">OWNER:</span> {fav.repository.owner}
                </div>
                <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-white/10">ADDED:</span> {new Date(fav.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center gap-8 pt-8 border-t border-white/5">
                {fav.repository.latestScanId ? (
                  <Link href={`/dashboard/${fav.repository.latestScanId}`} className="text-[10px] font-black uppercase tracking-[0.3em] text-white hover:text-lime-400 transition-colors">
                    Access Archive
                  </Link>
                ) : (
                  <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.3em] text-white hover:text-lime-400 transition-colors">
                    Initialize Scan
                  </Link>
                )}
                <a
                  href={fav.repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/20 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}