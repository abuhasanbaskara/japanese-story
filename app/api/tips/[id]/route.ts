import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/config/db'
import Tip from '@/lib/models/tip'

export async function GET(
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
          error: 'Invalid tip ID format' 
        },
        { status: 400 }
      )
    }

    const tip = await Tip.findById(id)

    if (!tip) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Tip not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: true,
        tip 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Error fetching tip:', error)

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to fetch tip'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    if (!id || id.length !== 24) {
      return NextResponse.json(
        { error: 'Invalid tip ID format' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, content, category, japaneseLevel, isActive, displayDate } = body

    const tip = await Tip.findById(id)

    if (!tip) {
      return NextResponse.json(
        { error: 'Tip not found' },
        { status: 404 }
      )
    }

    if (title !== undefined) tip.title = title
    if (content !== undefined) tip.content = content
    if (category !== undefined) tip.category = category
    if (japaneseLevel !== undefined) tip.japaneseLevel = japaneseLevel
    if (isActive !== undefined) tip.isActive = isActive
    if (displayDate !== undefined) tip.displayDate = new Date(displayDate)

    const updatedTip = await tip.save()

    revalidatePath('/')
    revalidatePath('/dashboard/tips')

    return NextResponse.json(
      { 
        message: 'Tip updated successfully',
        tip: updatedTip 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Error updating tip:', error)

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    if (!id || id.length !== 24) {
      return NextResponse.json(
        { error: 'Invalid tip ID format' },
        { status: 400 }
      )
    }

    const tip = await Tip.findByIdAndDelete(id)

    if (!tip) {
      return NextResponse.json(
        { error: 'Tip not found' },
        { status: 404 }
      )
    }

    revalidatePath('/')
    revalidatePath('/dashboard/tips')

    return NextResponse.json(
      { 
        message: 'Tip deleted successfully' 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Error deleting tip:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

