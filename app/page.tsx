import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StoryList } from "@/components/stories/story-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiUrl, isDevelopment } from "@/lib/utils";

interface Story {
  _id: string;
  title: string;
  story: string;
  date: string;
  imageUrl: string;
  category: string;
  japaneseLevel: string;
  access: "free" | "premium";
  createdAt?: string;
  updatedAt?: string;
}

async function getStories(): Promise<Story[]> {
  try {
    // Using ISR with 3-hour revalidation (3 * 60 * 60 = 10800 seconds)
    // For server components in Next.js App Router, we use absolute URL for internal API routes
    // getApiUrl() automatically handles dev vs prod URLs
    
    const res = await fetch(getApiUrl('/api/stories'), {
      ...(isDevelopment() 
        ? { cache: 'no-store' } // No cache in development - always fetch fresh data
        : { next: { revalidate: 10800 } } // 3 hours in production - ISR will revalidate after 3 hours
      ),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch stories");
    }

    const data = await res.json();
    return data.stories || [];
  } catch (error) {
    console.error("Error fetching stories:", error);
    return [];
  }
}

export default async function Home() {
  const stories = await getStories();

  const japaneseLevels = ["N6", "N5", "N4", "N3", "N2", "N1"];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Japanese Stories
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Learn Japanese through engaging stories for all levels
            </p>
          </div>

          {/* Tabs for Japanese Levels */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-1 h-auto p-1">
              <TabsTrigger value="all" className="text-[11px] sm:text-xs md:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                All
              </TabsTrigger>
              {japaneseLevels.map((level) => (
                <TabsTrigger key={level} value={level} className="text-[11px] sm:text-xs md:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                  {level}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* All Stories Tab */}
            <TabsContent value="all" className="mt-4 sm:mt-6">
              <StoryList stories={stories} />
            </TabsContent>

            {/* Individual Level Tabs */}
            {japaneseLevels.map((level) => (
              <TabsContent key={level} value={level} className="mt-4 sm:mt-6">
                <StoryList stories={stories} selectedLevel={level} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
