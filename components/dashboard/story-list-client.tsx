'use client'

import { useState } from 'react'
import { StoryListItem } from './story-list-item'

interface Story {
  _id: string
  title: string
  imageUrl: string
  date: string
  category: string
  japaneseLevel: string
  access: 'free' | 'premium'
}

interface StoryListClientProps {
  initialStories: Story[]
}

export function StoryListClient({ initialStories }: StoryListClientProps) {
  const [stories, setStories] = useState<Story[]>(initialStories)

  const handleDelete = (id: string) => {
    setStories((prev) => prev.filter((story) => story._id !== id))
  }

  if (stories.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Story List</h2>
        <div className="p-8 text-center text-muted-foreground">
          <p>No stories found. Create your first story above!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Story List</h2>
      <div className="space-y-2">
        {stories.map((story, index) => (
          <StoryListItem
            key={story._id}
            index={index + 1}
            story={story}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}

