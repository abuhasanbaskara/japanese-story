import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight">
            Japanese Story Project
          </h1>
          <p className="max-w-md text-lg leading-8 text-muted-foreground">
            Built with Next.js, Tailwind CSS v3, and shadcn/ui components.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild>
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="dark:invert"
                src="/vercel.svg"
                alt="Vercel logomark"
                width={16}
                height={16}
              />
              Deploy Now
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              shadcn/ui Docs
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
