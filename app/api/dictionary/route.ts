import { NextRequest, NextResponse } from 'next/server'
import { searchDictionary } from '@/lib/dictionary'
import { normalizeJapaneseWord } from '@/lib/japanese'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keyword = searchParams.get('keyword')?.trim()

    if (!keyword || keyword.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Keyword is required'
      }, { status: 400 })
    }

    const cleanedKeyword = keyword.replace(/[。、，．,.\r\n！？]/g, '').trim()

    if (cleanedKeyword.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Keyword is empty after cleaning'
      }, { status: 400 })
    }

    const normalizedKeyword = await normalizeJapaneseWord(cleanedKeyword)
    const results = searchDictionary(normalizedKeyword)
    
    if (results.length === 0 && normalizedKeyword !== cleanedKeyword) {
      const fallbackResults = searchDictionary(cleanedKeyword)
      if (fallbackResults.length > 0) {
        return NextResponse.json({
          success: true,
          data: fallbackResults,
          count: fallbackResults.length
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length
    })
  } catch (error) {
    console.error('Dictionary API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

