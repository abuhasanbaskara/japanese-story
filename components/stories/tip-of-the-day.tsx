import { Badge } from "@/components/ui/badge"
import { Lightbulb } from "lucide-react"

interface Tip {
  _id: string
  title: string
  content: string
  category: string
  japaneseLevel: string
  displayDate: string
}

interface TipOfTheDayProps {
  tip: Tip | null
}

export function TipOfTheDay({ tip }: TipOfTheDayProps) {
  if (!tip) {
    return null
  }

  const categoryLabels: Record<string, string> = {
    grammar: 'Grammar',
    vocabulary: 'Vocabulary',
    idiom: 'Idiom',
    culture: 'Culture',
    pronunciation: 'Pronunciation',
    other: 'Other',
  }

  const getCategoryLabel = (category: string) => categoryLabels[category] || category

  return (
    <div className="rounded-lg border border-muted bg-muted/30 p-3 sm:p-4">
      <div className="flex items-start gap-2 sm:gap-3">
        <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              Tip of the Day
            </span>
            <Badge variant="outline" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1.5 sm:px-2">
              {getCategoryLabel(tip.category)}
            </Badge>
            <Badge variant="outline" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1.5 sm:px-2">
              {tip.japaneseLevel}
            </Badge>
          </div>
          <h3 className="text-sm sm:text-base font-medium leading-snug">{tip.title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {tip.content}
          </p>
        </div>
      </div>
    </div>
  )
}

