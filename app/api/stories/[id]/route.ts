import { NextResponse } from 'next/server'
import connectDB from '@/lib/config/db'
import Story from '@/lib/models/story'

// GET /api/stories/[id] - Get a single story by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure database connection
    await connectDB()

    // Get the id from params
    const { id } = await params

    // Validate ID format (MongoDB ObjectId is 24 hex characters)
    if (!id || id.length !== 24) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid story ID format' 
        },
        { status: 400 }
      )
    }

    // Fetch the story by ID
    const story = await Story.findById(id)

    if (!story) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Story not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: true,
        story 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Error fetching story:', error)

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to fetch story'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/stories/[id] - Delete a story by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    if (!id || id.length !== 24) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid story ID format' 
        },
        { status: 400 }
      )
    }

    const story = await Story.findByIdAndDelete(id)

    if (!story) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Story not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Story deleted successfully'
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Error deleting story:', error)

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to delete story'
      },
      { status: 500 }
    )
  }
}

