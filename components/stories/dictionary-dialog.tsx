"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { fetchDictionaryWord, DictionaryEntry } from "@/lib/jisho";

interface DictionaryDialogProps {
  word: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DictionaryDialog({
  word,
  open,
  onOpenChange,
}: DictionaryDialogProps) {
  const [data, setData] = useState<DictionaryEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && word) {
      setIsLoading(true);
      setError(null);
      
      fetchDictionaryWord(word)
        .then((response) => {
          if (response.success && response.data.length > 0) {
            setData(response.data);
          } else {
            setData([]);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to fetch word definition");
          setIsLoading(false);
        });
    } else if (!open) {
      setData(null);
      setError(null);
    }
  }, [open, word]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{word}</DialogTitle>
          <DialogDescription>
            Dictionary definition
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Looking up definition...
            </span>
          </div>
        )}

        {error && (
          <div className="py-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!isLoading && !error && data && data.length > 0 && (
          <div className="space-y-6">
            {data.map((wordData, index) => (
              <div key={`${wordData.id}_${index}`} className="space-y-4 border-b pb-4 last:border-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {wordData.kanji.length > 0 ? (
                      wordData.kanji.map((kanji, kIndex) => (
                        <div key={kIndex} className="flex items-center gap-2">
                          <span className="text-xl font-semibold">
                            {kanji.text}
                          </span>
                          {wordData.reading.length > 0 && (
                            <span className="text-lg text-muted-foreground">
                              ({wordData.reading[0].text})
                            </span>
                          )}
                        </div>
                      ))
                    ) : wordData.reading.length > 0 ? (
                      <span className="text-xl font-semibold">
                        {wordData.reading[0].text}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {wordData.common && (
                      <Badge variant="secondary" className="text-xs">
                        Common
                      </Badge>
                    )}
                    {wordData.jlpt && wordData.jlpt.map((level, lIndex) => (
                      <Badge key={lIndex} variant="outline" className="text-xs">
                        JLPT {level}
                      </Badge>
                    ))}
                    {wordData.tags && wordData.tags.map((tag, tIndex) => (
                      <Badge key={tIndex} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Definitions
                  </h4>
                  {wordData.sense.slice(0, 5).map((sense, sIndex) => (
                    <div key={sIndex} className="space-y-2 pl-4 border-l-2 border-primary/20">
                      <div className="space-y-1.5">
                        <p className="font-medium text-base leading-relaxed">
                          {sense.gloss.slice(0, 3).join("; ")}
                          {sense.gloss.length > 3 && (
                            <span className="text-muted-foreground">
                              {" "}(+{sense.gloss.length - 3} more)
                            </span>
                          )}
                        </p>
                        {sense.pos.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {sense.pos.slice(0, 3).map((pos, pIndex) => (
                              <span
                                key={pIndex}
                                className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
                              >
                                {pos}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && data && data.length === 0 && (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              No definition found for "{word}"
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

