interface TokenizerResult {
  tokens: string[];
  rawTokens: any[];
}

interface TokenizerInstance {
  tokenize: (text: string) => any[];
}

let tokenizerInstance: TokenizerInstance | null = null;
let tokenizerInitializing = false;
let tokenizerInitPromise: Promise<TokenizerInstance> | null = null;

async function initializeTokenizer(): Promise<TokenizerInstance> {
  if (tokenizerInstance) {
    return tokenizerInstance;
  }

  if (tokenizerInitPromise) {
    return tokenizerInitPromise;
  }

  if (typeof window === 'undefined') {
    throw new Error('Tokenizer can only be initialized in browser environment');
  }

  tokenizerInitializing = true;
  
  tokenizerInitPromise = new Promise(async (resolve, reject) => {
    try {
      const kuromojiModule = await import('kuromoji');
      const Kuromoji = kuromojiModule.default || kuromojiModule;
      
      if (!Kuromoji || !Kuromoji.builder) {
        throw new Error('kuromoji module not properly loaded');
      }
      
      Kuromoji.builder({ dicPath: '/kuromoji-dict/' })
        .build((err: any, tokenizer: TokenizerInstance) => {
          tokenizerInitializing = false;
          if (err) {
            reject(err);
            return;
          }
          tokenizerInstance = tokenizer;
          resolve(tokenizer);
        });
    } catch (error) {
      tokenizerInitializing = false;
      reject(error);
    }
  });

  return tokenizerInitPromise;
}

function simpleTokenizer(text: string): string[] {
  const furiganaPattern = /[^\(\)]+\([^\(\)]+\)/g;
  const furiganaMatches: Array<{ match: string; index: number }> = [];
  let match;
  
  while ((match = furiganaPattern.exec(text)) !== null) {
    furiganaMatches.push({
      match: match[0],
      index: match.index,
    });
  }

  const particles = [
    'は', 'が', 'を', 'に', 'へ', 'で', 'と', 'も', 'から', 'まで',
    'より', 'の', 'か', 'や', 'など', 'だけ', 'ばかり', 'ほど',
    'くらい', 'ぐらい', 'までに', 'によって', 'について', 'に対して'
  ];

  let processedText = text;
  const placeholderMap = new Map<string, string>();
  furiganaMatches.forEach((fm, index) => {
    const placeholder = `__FURIGANA_${index}__`;
    placeholderMap.set(placeholder, fm.match);
    processedText = processedText.replace(fm.match, placeholder);
  });

  const particleRegex = new RegExp(`(${particles.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  let tokens: string[] = [];
  let lastIndex = 0;
  let particleMatch;

  while ((particleMatch = particleRegex.exec(processedText)) !== null) {
    if (particleMatch.index > lastIndex) {
      const beforeText = processedText.substring(lastIndex, particleMatch.index).trim();
      if (beforeText) {
        tokens.push(beforeText);
      }
    }
    
    tokens.push(particleMatch[1]);
    lastIndex = particleRegex.lastIndex;
  }

  if (lastIndex < processedText.length) {
    const remainingText = processedText.substring(lastIndex).trim();
    if (remainingText) {
      tokens.push(remainingText);
    }
  }

  tokens = tokens.map(token => {
    let restored = token;
    placeholderMap.forEach((original, placeholder) => {
      if (restored.includes(placeholder)) {
        restored = restored.replace(placeholder, original);
      }
    });
    return restored;
  });

  return tokens.filter(t => t.trim().length > 0);
}

export async function tokenizeJapanese(
  text: string,
  preserveFurigana: boolean = true
): Promise<TokenizerResult> {
  if (!text || !text.trim()) {
    return { tokens: [], rawTokens: [] };
  }

  let cleanText = text.trim();
  const furiganaMap = new Map<string, string>();
  
  if (preserveFurigana) {
    const furiganaPattern = /([^\(\)]+)\(([^\(\)]+)\)/g;
    let match;
    let index = 0;
    
    while ((match = furiganaPattern.exec(cleanText)) !== null) {
      const fullMatch = match[0];
      const placeholder = `__FURIGANA_${index}__`;
      furiganaMap.set(placeholder, fullMatch);
      cleanText = cleanText.replace(fullMatch, placeholder);
      index++;
    }
  }

  try {
    const tokenizer = await initializeTokenizer();
    const rawTokens = tokenizer.tokenize(cleanText);
    const tokens: string[] = [];

    rawTokens.forEach((token: any) => {
      const surface = token.surface_form;
      const isPunctuation = /[、。！？\s]/.test(surface);

      if (!isPunctuation || surface.trim()) {
        tokens.push(surface);
      }
    });

    if (preserveFurigana && furiganaMap.size > 0) {
      const restoredTokens = tokens.map(token => {
        let restored = token;
        furiganaMap.forEach((original, placeholder) => {
          if (restored.includes(placeholder)) {
            restored = restored.replace(placeholder, original);
          }
        });
        return restored;
      });
      
      return { tokens: restoredTokens, rawTokens };
    }

    return { tokens, rawTokens };
  } catch {
    try {
      const tinySegmenterModule = await import('tiny-segmenter');
      const TinySegmenter = tinySegmenterModule.default || tinySegmenterModule;
      const segmenter = typeof TinySegmenter === 'function' ? new TinySegmenter() : TinySegmenter;
      const segments = segmenter.segment(cleanText);
      const tokens = segments.filter((seg: string) => seg.trim().length > 0);
      
      if (preserveFurigana && furiganaMap.size > 0) {
        const restoredTokens = tokens.map((token: string) => {
          let restored = token;
          furiganaMap.forEach((original, placeholder) => {
            if (restored.includes(placeholder)) {
              restored = restored.replace(placeholder, original);
            }
          });
          return restored;
        });
        
        return { tokens: restoredTokens, rawTokens: [] };
      }
      
      return { tokens, rawTokens: [] };
    } catch {
      const tokens = simpleTokenizer(cleanText);
      
      if (preserveFurigana && furiganaMap.size > 0) {
        const restoredTokens = tokens.map(token => {
          let restored = token;
          furiganaMap.forEach((original, placeholder) => {
            if (restored.includes(placeholder)) {
              restored = restored.replace(placeholder, original);
            }
          });
          return restored;
        });
        
        return { tokens: restoredTokens, rawTokens: [] };
      }
      
      return { tokens, rawTokens: [] };
    }
  }
}

export function tokenizeJapaneseSync(text: string): string[] {
  if (!text || !text.trim()) {
    return [];
  }

  try {
    if (typeof window !== 'undefined') {
      const TinySegmenter = require('tiny-segmenter');
      const segmenter = typeof TinySegmenter === 'function' ? new TinySegmenter() : TinySegmenter;
      const segments = segmenter.segment(text);
      return segments.filter((seg: string) => seg.trim().length > 0);
    }
  } catch {
  }

  return simpleTokenizer(text);
}

export function formatTokens(tokens: string[], separator: string = '・'): string {
  return tokens.join(separator);
}

