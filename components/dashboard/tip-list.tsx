'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Tip {
  _id: string
  title: string
  content: string
  category: string
  japaneseLevel: string
  isActive: boolean
  displayDate: string
  createdAt?: string
  updatedAt?: string
}

interface TipListProps {
  onDelete?: () => void
  refreshKey?: number
}

export function TipList({ onDelete, refreshKey }: TipListProps) {
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchTips()
  }, [refreshKey])

  const fetchTips = async () => {
    try {
      const response = await fetch('/api/tips')
      const data = await response.json()
      if (data.success && data.tips) {
        setTips(data.tips)
      }
    } catch (error) {
      console.error('Error fetching tips:', error)
      toast.error('Failed to fetch tips')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    setDeletingIds(prev => new Set(prev).add(id))

    try {
      const response = await fetch(`/api/tips/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Tip deleted successfully')
        setTips(prev => prev.filter(tip => tip._id !== id))
        onDelete?.()
      } else {
        toast.error(data.error || 'Failed to delete tip')
      }
    } catch (error) {
      console.error('Error deleting tip:', error)
      toast.error('Failed to delete tip')
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      grammar: 'Grammar',
      vocabulary: 'Vocabulary',
      idiom: 'Idiom',
      culture: 'Culture',
      pronunciation: 'Pronunciation',
      other: 'Other',
    }
    return categoryMap[category] || category
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading tips...</span>
      </div>
    )
  }

  if (tips.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No tips found. Create your first tip above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tips.map((tip, index) => (
        <Card key={tip._id} className="hover:bg-muted/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  <h3 className="font-semibold text-lg">{tip.title}</h3>
                  {!tip.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {tip.content}
                </p>
                
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {getCategoryLabel(tip.category)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {tip.japaneseLevel}
                  </Badge>
                  <span>•</span>
                  <span>{formatDate(tip.displayDate)}</span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(tip._id, tip.title)}
                  disabled={deletingIds.has(tip._id)}
                  className="gap-2"
                >
                  {deletingIds.has(tip._id) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

