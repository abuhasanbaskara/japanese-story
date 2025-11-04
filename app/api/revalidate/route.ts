import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    // Revalidate the home page
    revalidatePath('/')
    
    return NextResponse.json(
      { 
        message: 'Path revalidated successfully',
        revalidated: true,
        now: Date.now()
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error revalidating path:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate path' },
      { status: 500 }
    )
  }
}
