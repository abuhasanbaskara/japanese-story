'use client'

import { useEffect, useState } from 'react'
import { StoryListClient } from './story-list-client'

interface Story {
  _id: string
  title: string
  imageUrl: string
  date: string
  category: string
  japaneseLevel: string
  access: 'free' | 'premium'
}

export function StoryList() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/stories')
        const data = await response.json()
        if (data.success && data.stories) {
          const formattedStories = data.stories.map((story: any) => ({
            _id: story._id.toString(),
            title: story.title,
            imageUrl: story.imageUrl,
            date: story.date ? new Date(story.date).toISOString() : new Date(story.createdAt).toISOString(),
            category: story.category || '',
            japaneseLevel: story.japaneseLevel || '',
            access: story.access || 'free',
          }))
          setStories(formattedStories)
        }
      } catch (error) {
        console.error('Error fetching stories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Story List</h2>
        <div className="p-8 text-center text-muted-foreground">Loading stories...</div>
      </div>
    )
  }

  return <StoryListClient initialStories={stories} />
}

