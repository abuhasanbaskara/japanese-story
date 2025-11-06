import connectDB from '@/lib/config/db'
import Tip from '@/lib/models/tip'
import { isDevelopment } from '@/lib/utils'

interface TipData {
  _id: string
  title: string
  content: string
  category: string
  japaneseLevel: string
  isActive: boolean
  displayDate: string
}

export async function getTipOfTheDay(): Promise<TipData | null> {
  try {
    await connectDB()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Try to find tip for today first
    const todayStart = new Date(today)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    const todayTip = await Tip.findOne({
      isActive: true,
      displayDate: {
        $gte: todayStart,
        $lte: todayEnd
      }
    }).sort({ displayDate: -1 })

    if (todayTip) {
      return {
        _id: todayTip._id.toString(),
        title: todayTip.title,
        content: todayTip.content,
        category: todayTip.category,
        japaneseLevel: todayTip.japaneseLevel,
        isActive: todayTip.isActive,
        displayDate: todayTip.displayDate.toISOString()
      }
    }

    // If no tip for today, get the most recent active tip
    const recentTip = await Tip.findOne({
      isActive: true
    }).sort({ displayDate: -1, createdAt: -1 })

    if (recentTip) {
      return {
        _id: recentTip._id.toString(),
        title: recentTip.title,
        content: recentTip.content,
        category: recentTip.category,
        japaneseLevel: recentTip.japaneseLevel,
        isActive: recentTip.isActive,
        displayDate: recentTip.displayDate.toISOString()
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching tip of the day:", error)
    return null
  }
}

