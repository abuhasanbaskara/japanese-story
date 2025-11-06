import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface StoryCardProps {
  _id: string;
  title: string;
  story: string;
  date: string;
  imageUrl: string;
  category: string;
  japaneseLevel: string;
  access: "free" | "premium";
}

export function StoryCard({
  _id,
  title,
  story,
  date,
  imageUrl,
  category,
  japaneseLevel,
  access,
}: StoryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link href={`/stories/${_id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] md:hover:scale-[1.02] active:scale-[0.98] cursor-pointer h-full">
        <div className="relative">
          {/* Image Container */}
          <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-muted">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Access Badge Overlay */}
            {access === "premium" && (
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                  Premium
                </Badge>
              </div>
            )}
            
            {access === "free" && (
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white border-0 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                  Free
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {/* Japanese Level Badge */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
              {japaneseLevel}
            </Badge>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="whitespace-nowrap">{formatDate(date)}</span>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="font-semibold text-base sm:text-lg line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {title}
          </h3>
          
          {/* Story Preview */}
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed">
            {story.replace(/[\s\u3000]+/g, '')}
          </p>
          
          {/* Category */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
              {category}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
