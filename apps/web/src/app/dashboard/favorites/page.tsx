'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, GitBranch, Clock, Trash2, ExternalLink, AlertCircle } from 'lucide-react'
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
  const { data: session } = useSession()
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
      setError('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (repositoryId: string) => {
    try {
      await apiClient.delete(`/favorites/${repositoryId}`)
      setFavorites(favorites.filter(f => f.repositoryId !== repositoryId))
    } catch (err) {
      console.error('Failed to remove favorite:', err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 1) return 'Today'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (false && !session) {
    return (
      <div className="text-center py-12">
        <p className="text-white/50">Please sign in to view your favorites</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Favorites</h1>
        <p className="text-white/50 mt-2">
          {favorites.length > 0 ? `${favorites.length} starred repositories` : 'Your starred repositories for quick access'}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <Skeleton className="h-6 w-3/4 bg-white/10 mb-3" />
              <Skeleton className="h-4 w-1/2 bg-white/5 mb-2" />
              <Skeleton className="h-4 w-2/3 bg-white/5" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-white/50 mb-4">{error}</p>
          <Button 
            onClick={fetchFavorites} 
            className="bg-lime-400 hover:bg-lime-500 text-black"
          >
            Retry
          </Button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-white/30" />
          </div>
          <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
          <p className="text-white/40 mb-6">
            Star repositories from your scans to keep track of them here
          </p>
          <Link href="/dashboard">
            <Button className="bg-lime-400 hover:bg-lime-500 text-black">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <div key={fav.id} className="glass glass-hover rounded-2xl p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <h3 className="font-semibold truncate">
                    {fav.repository.owner}/{fav.repository.name}
                  </h3>
                </div>
                <button
                  onClick={() => removeFavorite(fav.repositoryId)}
                  className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 text-sm text-white/40 mb-5">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Added {formatDate(fav.createdAt)}</span>
                </div>
                {fav.repository.latestScanAt && (
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    <span>Last scan {formatDate(fav.repository.latestScanAt)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {fav.repository.latestScanId ? (
                  <Link href={`/dashboard/${fav.repository.latestScanId}`} className="flex-1">
                    <Button 
                      size="sm" 
                      className="w-full bg-lime-400 hover:bg-lime-500 text-black font-medium"
                    >
                      View Scan
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard" className="flex-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    >
                      New Scan
                    </Button>
                  </Link>
                )}
                <a
                  href={fav.repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
