import fs from 'fs'
import path from 'path'

export interface DictionaryEntry {
  id: string
  kanji?: Array<{
    text: string
    common?: boolean
  }>
  reading: Array<{
    text: string
    common?: boolean
  }>
  sense: Array<{
    pos?: string[]
    gloss: string[]
    lang?: string
  }>
  common?: boolean
  tags?: string[]
  jlpt?: string[]
}

let dictionaryCache: DictionaryEntry[] | null = null
let dictionaryIndex: Map<string, DictionaryEntry[]> | null = null

function extractTextFromStructuredContent(obj: any): string[] {
  const texts: string[] = []
  
  if (typeof obj === 'string') {
    const trimmed = obj.trim()
    if (trimmed) {
      texts.push(trimmed)
    }
  } else if (Array.isArray(obj)) {
    for (const item of obj) {
      texts.push(...extractTextFromStructuredContent(item))
    }
  } else if (obj && typeof obj === 'object') {
    if (obj.content) {
      const extracted = extractTextFromStructuredContent(obj.content)
      if (extracted.length > 0) {
        texts.push(...extracted)
      }
    }
    if (obj.text !== undefined) {
      const text = String(obj.text).trim()
      if (text) texts.push(text)
    }
    if (obj.tag === 'li' && obj.content) {
      const extracted = extractTextFromStructuredContent(obj.content)
      const joined = extracted.join(' ').trim()
      if (joined) texts.push(joined)
    }
  }
  
  return texts.filter((t, i, arr) => arr.indexOf(t) === i && t.length > 0)
}

function loadDictionary(): DictionaryEntry[] {
  if (dictionaryCache) {
    return dictionaryCache
  }

  const dictPath = path.join(process.cwd(), 'lib', 'data', 'jmdict.json')
  
  if (!fs.existsSync(dictPath)) {
    console.warn('⚠️  Dictionary file not found:', dictPath)
    return []
  }

  try {
    const fileContent = fs.readFileSync(dictPath, 'utf8')
    const termBank = JSON.parse(fileContent)
    
    if (!Array.isArray(termBank)) {
      console.error('❌ Invalid dictionary format: expected array')
      return []
    }

    const seenIds = new Set<string>()
    
    dictionaryCache = termBank.map((entry: any, idx: number) => {
      if (Array.isArray(entry)) {
        const term = entry[0]
        const reading = entry[1]
        const rules = entry[2]
        const score = entry[4] || 0
        const glossary = entry[5] || []
        const sequence = entry[6]
        const tags = entry[7]
        
        const glossTexts: string[] = []
        
        if (Array.isArray(glossary)) {
          for (const g of glossary) {
            if (g && typeof g === 'object' && g.type === 'structured-content' && g.content) {
              const extracted = extractTextFromStructuredContent(g.content)
              glossTexts.push(...extracted)
            } else if (typeof g === 'string') {
              glossTexts.push(g.trim())
            } else if (g && typeof g === 'object' && g.text) {
              glossTexts.push(String(g.text).trim())
            }
          }
        }
        
        const posArray = typeof rules === 'string' ? rules.split(' ').filter(Boolean) : (Array.isArray(rules) ? rules : [])
        
        if (glossTexts.length === 0) {
          return null
        }
        
        let uniqueId = `yomitan_${sequence || idx}`
        let counter = 0
        while (seenIds.has(uniqueId)) {
          counter++
          uniqueId = `yomitan_${sequence || idx}_${counter}`
        }
        seenIds.add(uniqueId)
        
        return {
          id: uniqueId,
          kanji: term ? [{
            text: String(term),
            common: score > 0 || false
          }] : [],
          reading: reading ? [{
            text: String(reading),
            common: score > 0 || false
          }] : [],
          sense: [{
            pos: posArray,
            gloss: glossTexts.filter((g: string) => g && g.trim().length > 0),
            lang: 'eng'
          }],
          common: score > 0 || false,
          tags: Array.isArray(tags) ? tags : (tags ? [String(tags)] : []),
          jlpt: []
        }
      }
      
      return null
    }).filter((entry: DictionaryEntry | null): entry is DictionaryEntry => 
      entry !== null && entry.sense.length > 0 && entry.sense[0].gloss.length > 0
    )

    return dictionaryCache
  } catch (error) {
    console.error('❌ Error loading dictionary:', error)
    return []
  }
}

function buildIndex(): Map<string, DictionaryEntry[]> {
  if (dictionaryIndex) {
    return dictionaryIndex
  }

  const dictionary = loadDictionary()
  const index = new Map<string, DictionaryEntry[]>()

  for (const entry of dictionary) {
    const searchTerms = new Set<string>()

    if (entry.kanji && entry.kanji.length > 0) {
      for (const k of entry.kanji) {
        if (k.text && k.text.trim().length > 0) {
          searchTerms.add(k.text.trim())
        }
      }
    }

    if (entry.reading && entry.reading.length > 0) {
      for (const r of entry.reading) {
        if (r.text && r.text.trim().length > 0) {
          searchTerms.add(r.text.trim())
        }
      }
    }

    for (const term of searchTerms) {
      if (!index.has(term)) {
        index.set(term, [])
      }
      index.get(term)!.push(entry)
    }
  }

  dictionaryIndex = index
  return index
}

export function searchDictionary(keyword: string): DictionaryEntry[] {
  if (!keyword || keyword.trim().length === 0) {
    return []
  }

  const cleaned = keyword.trim()
  const index = buildIndex()
  
  const results = index.get(cleaned) || []
  
  return results
    .filter(entry => entry.sense && entry.sense.length > 0)
    .sort((a, b) => {
      if (a.common && !b.common) return -1
      if (!a.common && b.common) return 1
      
      const aHasKanji = a.kanji && a.kanji.length > 0
      const bHasKanji = b.kanji && b.kanji.length > 0
      if (aHasKanji && !bHasKanji) return -1
      if (!aHasKanji && bHasKanji) return 1
      
      return 0
    })
    .slice(0, 10)
    .map(entry => ({
      ...entry,
      sense: entry.sense.slice(0, 5).map(sense => ({
        ...sense,
        gloss: sense.gloss.slice(0, 5)
      }))
    }))
}

export function getDictionaryStats() {
  const dictionary = loadDictionary()
  const index = buildIndex()
  
  return {
    totalEntries: dictionary.length,
    indexedTerms: index.size
  }
}
