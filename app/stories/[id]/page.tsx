import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StoryReader } from "@/components/stories/story-reader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Tag, BookOpen, Lock } from "lucide-react";
import { getApiUrl, isDevelopment } from "@/lib/api";

interface Story {
  _id: string;
  title: string;
  story: string;
  date: string;
  imageUrl: string;
  category: string;
  japaneseLevel: string;
  access: "free" | "premium";
  author?: string;
  tokens?: string[];
  createdAt?: string;
  updatedAt?: string;
}

async function getStory(id: string): Promise<Story | null> {
  try {
    // Using ISR with 3-hour revalidation (3 * 60 * 60 = 10800 seconds)
    // For server components in Next.js App Router, we use absolute URL for internal API routes
    // getApiUrl() automatically handles dev vs prod URLs
    const res = await fetch(getApiUrl(`/api/stories/${id}`), {
      ...(isDevelopment()
        ? { cache: "no-store" } // No cache in development - always fetch fresh data
        : { next: { revalidate: 10800 } }), // 3 hours in production - ISR will revalidate after 3 hours
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch story");
    }

    const data = await res.json();
    return data.story || null;
  } catch (error) {
    console.error("Error fetching story:", error);
    return null;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await getStory(id);

  if (!story) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        <article className="space-y-6 sm:space-y-8">
          {/* Story Image */}
          <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden bg-muted">
            <Image
              src={story.imageUrl}
              alt={story.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
              priority
            />
            {/* Access Badge Overlay */}
            {story.access === "premium" && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0">
                  Premium
                </Badge>
              </div>
            )}
            {story.access === "free" && (
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white border-0">
                  Free
                </Badge>
              </div>
            )}
          </div>

          {/* Story Title */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {story.title}
            </h1>
          </div>

          {/* Story Content */}
          <Card>
            <CardContent className="p-6 sm:p-8">
              <StoryReader story={story.story} tokens={story.tokens} />
            </CardContent>
          </Card>

          {/* Story Metadata */}
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Story Information</h2>
                <Separator />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{formatDate(story.date)}</p>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Author</p>
                      <p className="font-medium">{story.author || "Admin"}</p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <Badge variant="secondary" className="mt-1">
                        {story.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Japanese Level */}
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Japanese Level</p>
                      <Badge variant="outline" className="mt-1">
                        {story.japaneseLevel}
                      </Badge>
                    </div>
                  </div>

                  {/* Access */}
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Access</p>
                      <Badge
                        className={`mt-1 ${
                          story.access === "premium"
                            ? "bg-amber-500 hover:bg-amber-600 text-white border-0"
                            : "bg-green-500 hover:bg-green-600 text-white border-0"
                        }`}
                      >
                        {story.access === "premium" ? "Premium" : "Free"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

