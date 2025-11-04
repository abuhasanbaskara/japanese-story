import { StoryCard } from "@/components/stories/story-card";

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

interface StoryListProps {
  stories: Story[];
  selectedLevel?: string;
}

export function StoryList({ stories, selectedLevel }: StoryListProps) {
  // Filter stories by selected Japanese level
  const filteredStories = selectedLevel
    ? stories.filter((story) => story.japaneseLevel === selectedLevel)
    : stories;

  if (filteredStories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          No stories found
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {selectedLevel
            ? `No stories available for level ${selectedLevel}`
            : "No stories available yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {filteredStories.map((story) => (
        <StoryCard key={story._id} {...story} />
      ))}
    </div>
  );
}
