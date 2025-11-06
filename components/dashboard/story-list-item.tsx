'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface StoryListItemProps {
  index: number
  story: {
    _id: string
    title: string
    imageUrl: string
    date: string
    category: string
    japaneseLevel: string
    access: 'free' | 'premium'
  }
  onDelete?: (id: string) => void
}

export function StoryListItem({ index, story, onDelete }: StoryListItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${story.title}"?`)) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/stories/${story._id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Story deleted successfully')
        if (onDelete) {
          onDelete(story._id)
        } else {
          window.location.reload()
        }
      } else {
        if (response.status === 400) {
          toast.error(data.error || 'Failed to delete story')
          if (onDelete) {
            onDelete(story._id)
          }
        } else {
          toast.error(data.error || 'Failed to delete story')
        }
      }
    } catch (error) {
      console.error('Error deleting story:', error)
      toast.error('Failed to delete story')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0 w-12 text-center text-sm font-medium text-muted-foreground">
        {index}
      </div>
      
      <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        <Image
          src={story.imageUrl}
          alt={story.title}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">{story.title}</h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{formatDate(story.date)}</span>
          <span>•</span>
          <span>{story.category}</span>
          <span>•</span>
          <span>{story.japaneseLevel}</span>
          <span>•</span>
          <span className="capitalize">{story.access}</span>
        </div>
      </div>

      <div className="flex-shrink-0">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </div>
  )
}

