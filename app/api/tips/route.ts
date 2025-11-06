import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/config/db'
import Tip from '@/lib/models/tip'

export async function POST(request: Request) {
  try {
    await connectDB()

    const body = await request.json()
    const { title, content, category, japaneseLevel, isActive, displayDate } = body

    if (!title || !content || !category || !japaneseLevel) {
      return NextResponse.json(
        { error: 'All required fields must be provided: title, content, category, japaneseLevel' },
        { status: 400 }
      )
    }

    const newTip = new Tip({
      title,
      content,
      category,
      japaneseLevel,
      isActive: isActive !== undefined ? isActive : true,
      displayDate: displayDate ? new Date(displayDate) : new Date()
    })

    const savedTip = await newTip.save()

    revalidatePath('/')
    revalidatePath('/dashboard/tips')

    return NextResponse.json(
      { 
        message: 'Tip created successfully',
        tip: savedTip 
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Error creating tip:', error)
    
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

export async function GET() {
  try {
    await connectDB()

    const tips = await Tip.find().sort({ displayDate: -1, createdAt: -1 })

    return NextResponse.json(
      { 
        success: true,
        count: tips.length,
        tips 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Error fetching tips:', error)

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to fetch tips'
      },
      { status: 500 }
    )
  }
}

