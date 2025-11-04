import { NextResponse } from 'next/server'
import connectDB from '@/lib/config/db'
import Story from '@/lib/models/story'

// POST /api/stories - Create a new story
export async function POST(request: Request) {
  try {
    // Ensure database connection
    await connectDB()

    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    const { title, story, date, imageUrl, category, japaneseLevel, access } = body

    if (!title || !story || !date || !imageUrl || !category || !japaneseLevel || !access) {
      return NextResponse.json(
        { error: 'All fields are required: title, story, date, imageUrl, category, japaneseLevel, access' },
        { status: 400 }
      )
    }

    // Validate access value
    if (access !== 'free' && access !== 'premium') {
      return NextResponse.json(
        { error: 'Access must be either "free" or "premium"' },
        { status: 400 }
      )
    }

    // Create new story
    const newStory = new Story({
      title,
      story,
      date,
      imageUrl,
      category,
      japaneseLevel,
      access
    })

    // Save to database
    const savedStory = await newStory.save()

    // Return success response
    return NextResponse.json(
      { 
        message: 'Story created successfully',
        story: savedStory 
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Error creating story:', error)
    
    // Handle duplicate key or validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/stories - Get all stories
export async function GET() {
  try {
    // Ensure database connection
    await connectDB()

    // Fetch all stories
    const stories = await Story.find().sort({ date: -1 })

    return NextResponse.json(
      { stories },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Error fetching stories:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

