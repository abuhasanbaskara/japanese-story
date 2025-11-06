"use client";

import { useState, useEffect, useRef } from "react";
import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
import { Button } from "@/components/ui/button";
import { BookOpen, BookOpenCheck, Loader2, Type } from "lucide-react";
import { ClickableText } from "./clickable-text";

interface StoryReaderProps {
  story: string;
  tokens?: string[];
}

const TEXT_SIZES = [0.5, 1.0, 2.0, 2.5] as const;

export function StoryReader({ story, tokens }: StoryReaderProps) {
  const [showFurigana, setShowFurigana] = useState(false);
  const [furiganaText, setFuriganaText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [textSize, setTextSize] = useState<number>(1.0);
  const kuroshiroRef = useRef<Kuroshiro | null>(null);

  useEffect(() => {
    const initKuroshiro = async () => {
      try {
        const kuroshiroInstance = new Kuroshiro();
        const analyzer = new KuromojiAnalyzer({
          dictPath: "/kuromoji-dict/",
        });
        await kuroshiroInstance.init(analyzer);
        kuroshiroRef.current = kuroshiroInstance;
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize Kuroshiro:", error);
        setIsInitialized(false);
      }
    };

    initKuroshiro();
  }, []);

  useEffect(() => {
    if (showFurigana && kuroshiroRef.current && story && isInitialized) {
      setIsLoading(true);
      
      const spacePattern = /[\s\u3000]+/g;
      const tokens = story.split(spacePattern).filter(t => t.trim());
      
      Promise.all(
        tokens.map(async (token) => {
          try {
            const converted = await kuroshiroRef.current!.convert(token, {
              to: "hiragana",
              mode: "furigana",
              romajiSystem: "hepburn",
            });
            const escapedToken = token.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            return `<span class="word" data-word="${escapedToken}" style="cursor: pointer; border-bottom: 1.5px solid rgba(59, 130, 246, 0.4); padding-bottom: 1px; display: inline; user-select: none; margin-right: 3px;">${converted}</span>`;
          } catch (error) {
            console.error(`Failed to convert token: ${token}`, error);
            const escapedToken = token.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            return `<span class="word" data-word="${escapedToken}" style="cursor: pointer; border-bottom: 1.5px solid rgba(59, 130, 246, 0.4); padding-bottom: 1px; display: inline; user-select: none; margin-right: 3px;">${token}</span>`;
          }
        })
      )
        .then((wrappedTokens) => {
          setFuriganaText(wrappedTokens.join('　'));
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to generate furigana:", error);
          setFuriganaText(story);
          setIsLoading(false);
        });
    } else if (!showFurigana) {
      setFuriganaText("");
    }
  }, [showFurigana, story, isInitialized]);

  const displayText = showFurigana && furiganaText ? furiganaText : story;
  const baseFontSize = 16;
  const fontSize = baseFontSize * textSize;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Text Size:</span>
          <div className="flex gap-1">
            {TEXT_SIZES.map((size) => (
              <Button
                key={size}
                variant={textSize === size ? "default" : "outline"}
                size="sm"
                onClick={() => setTextSize(size)}
                className={`min-w-[3rem] ${textSize === size ? "bg-primary text-primary-foreground" : ""}`}
              >
                {size}x
              </Button>
            ))}
          </div>
        </div>

        <Button
          variant={showFurigana ? "default" : "secondary"}
          size="sm"
          onClick={() => setShowFurigana(!showFurigana)}
          disabled={isLoading || !isInitialized}
          className={`gap-2 ${
            showFurigana
              ? "bg-blue-600 hover:bg-blue-700 text-white border-0"
              : "bg-purple-600 hover:bg-purple-700 text-white border-0"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : showFurigana ? (
            <>
              <BookOpenCheck className="h-4 w-4" />
              Hide Furigana
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4" />
              Show Furigana
            </>
          )}
        </Button>
      </div>

      <ClickableText
        html={displayText}
        originalText={story}
        fontSize={fontSize}
        isInitialized={isInitialized}
        kuroshiroRef={kuroshiroRef}
        tokens={tokens}
      />
    </div>
  );
}

