"use client";

import { useState, useEffect, useRef } from "react";
import { DictionaryDialog } from "./dictionary-dialog";
import { tokenizeJapanese } from "@/lib/japanese";

interface ClickableTextProps {
  html: string;
  originalText: string;
  fontSize: number;
  isInitialized: boolean;
  kuroshiroRef: React.RefObject<any>;
  tokens?: string[];
}

export function ClickableText({
  html,
  originalText,
  fontSize,
  isInitialized,
  kuroshiroRef,
  tokens: providedTokens,
}: ClickableTextProps) {
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processedHtml, setProcessedHtml] = useState<string>(html);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!html || !originalText) {
      setProcessedHtml(html);
      return;
    }

    const processText = () => {
      try {
        if (!originalText.trim()) {
          setProcessedHtml(html);
          return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const hasWordElements = tempDiv.querySelector('.word') !== null;
        
        if (hasWordElements) {
          setProcessedHtml(html);
          return;
        }
        
        const processNode = (node: Node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const textNode = node as Text;
            let text = textNode.textContent || '';
            let parent = textNode.parentElement;
            
            if (text.trim()) {
              const punctuationPattern = /([、。！？，．,.\r\n]+)/g;
              const spacePattern = /[\s\u3000]+/g;
              
              const parts: Array<{text: string, isPunctuation: boolean, isWord: boolean, preserveSpaceAfter?: boolean}> = [];
              let lastIndex = 0;
              
              let match;
              while ((match = punctuationPattern.exec(text)) !== null) {
                const beforeText = text.substring(lastIndex, match.index);
                
                if (beforeText.trim()) {
                  const beforeWords = beforeText.split(spacePattern).filter(w => w.trim());
                  beforeWords.forEach((word) => {
                    if (word.trim()) {
                      parts.push({text: word.trim(), isPunctuation: false, isWord: true});
                    }
                  });
                }
                
                const punctuation = match[0];
                const afterPunctuation = text.substring(match.index + punctuation.length, match.index + punctuation.length + 1);
                const hasSpaceAfter = /[\s\u3000]/.test(afterPunctuation);
                
                parts.push({text: punctuation, isPunctuation: true, isWord: false, preserveSpaceAfter: hasSpaceAfter});
                
                if (hasSpaceAfter) {
                  parts.push({text: ' ', isPunctuation: false, isWord: false, preserveSpaceAfter: false});
                }
                
                lastIndex = match.index + punctuation.length + (hasSpaceAfter ? 1 : 0);
              }
              
              if (lastIndex < text.length) {
                const remainingText = text.substring(lastIndex);
                const remainingWords = remainingText.split(spacePattern).filter(w => w.trim());
                remainingWords.forEach((word) => {
                  if (word.trim()) {
                    parts.push({text: word.trim(), isPunctuation: false, isWord: true});
                  }
                });
              }
              
              const fragment = document.createDocumentFragment();
              
              parts.forEach((part, index) => {
                if (part.isPunctuation) {
                  fragment.appendChild(document.createTextNode(part.text));
                } else if (!part.isWord && part.text === ' ') {
                  fragment.appendChild(document.createTextNode(' '));
                } else if (part.isWord) {
                  const cleanWord = part.text.replace(/[、。！？，．,.\s]+$/g, '').replace(/^[、。！？，．,.\s]+/g, '');
                  
                  if (cleanWord) {
                    const span = document.createElement('span');
                    span.className = 'cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors inline';
                    span.style.display = 'inline';
                    span.style.borderBottom = '1.5px solid rgba(59, 130, 246, 0.4)';
                    span.style.paddingBottom = '1px';
                    span.style.marginRight = '3px';
                    const escapedWord = cleanWord.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                    span.setAttribute('data-word', escapedWord);
                    span.textContent = part.text;
                    fragment.appendChild(span);
                  } else {
                    fragment.appendChild(document.createTextNode(part.text));
                  }
                }
              });
              
              if (fragment.childNodes.length > 0) {
                parent?.replaceChild(fragment, textNode);
              }
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName !== 'SPAN' || !element.hasAttribute('data-word')) {
              Array.from(element.childNodes).forEach(child => processNode(child));
            }
          }
        };
        
        Array.from(tempDiv.childNodes).forEach(child => processNode(child));
        
        setProcessedHtml(tempDiv.innerHTML);
      } catch (error) {
        console.error('Error processing text:', error);
        setProcessedHtml(html);
      }
    };

    processText();
  }, [html, originalText, isInitialized, kuroshiroRef]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const clickableWords = container.querySelectorAll('[data-word]');

    const handleClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget as HTMLElement;
      const word = target.getAttribute('data-word');
      if (word) {
        setSelectedWord(word);
        setIsDialogOpen(true);
      }
    };

    clickableWords.forEach((word) => {
      word.addEventListener('click', handleClick);
      word.classList.add('hover:bg-blue-100', 'dark:hover:bg-blue-900/30', 'transition-colors');
    });

    return () => {
      clickableWords.forEach((word) => {
        word.removeEventListener('click', handleClick);
      });
    };
  }, [processedHtml]);

  return (
    <>
      <div
        ref={containerRef}
        className="text-foreground leading-relaxed"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: "1.8",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        }}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
      <DictionaryDialog
        word={selectedWord}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}

