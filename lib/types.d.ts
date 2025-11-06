declare module 'tiny-segmenter' {
  class TinySegmenter {
    segment(text: string): string[];
  }
  export default TinySegmenter;
}

declare module 'kuromoji' {
  interface Builder {
    build(callback: (err: any, tokenizer: any) => void): void;
  }
  interface KuromojiStatic {
    builder(options: { dicPath: string }): Builder;
  }
  const kuromoji: KuromojiStatic;
  export default kuromoji;
}

