import connectDB from '@/lib/config/db'
import Story from '@/lib/models/story'

export async function fetchStories() {
  try {
    await connectDB()
    const stories = await Story.find().sort({ date: -1 }).lean()
    return stories.map((story: any) => ({
      _id: story._id.toString(),
      title: story.title,
      imageUrl: story.imageUrl,
      date: story.date ? new Date(story.date).toISOString() : new Date(story.createdAt).toISOString(),
      category: story.category || '',
      japaneseLevel: story.japaneseLevel || '',
      access: story.access || 'free',
    }))
  } catch (error) {
    console.error('Error fetching stories:', error)
    return []
  }
}

