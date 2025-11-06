import path from 'path'

let tokenizerInstance: any = null
let tokenizerInitializing = false
let tokenizerInitPromise: Promise<any> | null = null

async function initializeTokenizer(): Promise<any> {
  if (tokenizerInstance) {
    return tokenizerInstance
  }

  if (tokenizerInitPromise) {
    return tokenizerInitPromise
  }

  tokenizerInitializing = true
  
  tokenizerInitPromise = new Promise(async (resolve, reject) => {
    try {
      const kuromojiModule = await import('kuromoji')
      const Kuromoji = kuromojiModule.default || kuromojiModule
      
      if (!Kuromoji || !Kuromoji.builder) {
        throw new Error('kuromoji module not properly loaded')
      }
      
      const dicPath = path.join(process.cwd(), 'node_modules', 'kuromoji', 'dict')
      
      Kuromoji.builder({ dicPath }).build((err: any, tokenizer: any) => {
        tokenizerInitializing = false
        if (err) {
          reject(err)
          return
        }
        tokenizerInstance = tokenizer
        resolve(tokenizer)
      })
    } catch (error) {
      tokenizerInitializing = false
      reject(error)
    }
  })

  return tokenizerInitPromise
}

export async function normalizeJapaneseWord(input: string): Promise<string> {
  if (!input || input.trim().length === 0) {
    return input
  }

  try {
    const tokenizer = await initializeTokenizer()
    const tokens = tokenizer.tokenize(input)
    
    if (tokens.length === 0) {
      return input
    }

    const baseForms: string[] = []
    
    for (const token of tokens) {
      if (token.basic_form && token.basic_form !== '*' && token.basic_form !== token.surface_form) {
        baseForms.push(token.basic_form)
      } else {
        baseForms.push(token.surface_form)
      }
    }
    
    const normalized = baseForms.join('')
    
    if (tokens.length > 1) {
      const firstToken = tokens[0]
      if (firstToken.basic_form && firstToken.basic_form !== '*' && firstToken.basic_form !== firstToken.surface_form) {
        return firstToken.basic_form
      }
    }
    
    return normalized
  } catch {
    return input
  }
}
