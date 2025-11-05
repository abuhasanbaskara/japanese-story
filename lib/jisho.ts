export interface JishoWord {
  slug: string;
  is_common: boolean;
  tags: string[];
  jlpt: string[];
  japanese: Array<{
    word?: string;
    reading: string;
  }>;
  senses: Array<{
    english_definitions: string[];
    parts_of_speech: string[];
    links: Array<{
      text: string;
      url: string;
    }>;
    tags: string[];
    restrictions: string[];
    see_also: string[];
    antonyms: string[];
    source: Array<{
      language: string;
      word: string;
    }>;
    info: string[];
  }>;
}

export interface JishoResponse {
  meta: {
    status: number;
  };
  data: JishoWord[];
}

export interface DictionaryResponse {
  success: boolean;
  data: DictionaryEntry[];
  count: number;
}

export interface DictionaryEntry {
  id: string;
  kanji: Array<{
    text: string;
    common?: boolean;
  }>;
  reading: Array<{
    text: string;
    common?: boolean;
  }>;
  sense: Array<{
    pos: string[];
    gloss: string[];
    lang?: string;
  }>;
  common?: boolean;
  tags?: string[];
  jlpt?: string[];
}

export async function fetchDictionaryWord(keyword: string): Promise<DictionaryResponse> {
  try {
    let cleanKeyword = keyword.replace(/<[^>]*>/g, '').trim();
    
    if (!cleanKeyword) {
      throw new Error('Empty keyword');
    }

    cleanKeyword = cleanKeyword.replace(/[、。！？，．,.\s]+/g, '');

    if (!cleanKeyword) {
      return {
        success: true,
        data: [],
        count: 0
      };
    }

    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(
      `${baseUrl}/api/dictionary?keyword=${encodeURIComponent(cleanKeyword)}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Dictionary API error: ${response.status}`);
    }

    const data: DictionaryResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from dictionary:', error);
    throw error;
  }
}


