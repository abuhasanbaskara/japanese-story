import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 max-w-2xl text-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">Story Not Found</h1>
          <p className="text-lg text-muted-foreground">
            The story you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/">
            <Button>Back to Stories</Button>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

