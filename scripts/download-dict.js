const https = require('https')
const fs = require('fs')
const path = require('path')
const unzipper = require('unzipper')
const os = require('os')

async function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath)
    
    const request = https.get(url, { 
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
        file.close()
        fs.unlinkSync(filePath)
        return downloadFile(response.headers.location, filePath).then(resolve).catch(reject)
      }
      
      if (response.statusCode !== 200) {
        file.close()
        fs.unlinkSync(filePath)
        return reject(new Error(`Failed to download: ${response.statusCode}`))
      }
      
      const totalSize = parseInt(response.headers['content-length'], 10)
      let downloaded = 0
      
      response.on('data', (chunk) => {
        downloaded += chunk.length
        const percent = ((downloaded / totalSize) * 100).toFixed(1)
        process.stdout.write(`\r📥 Downloading... ${percent}%`)
      })
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        console.log('\n✅ Download completed!')
        resolve()
      })
    })
    
    request.on('error', reject)
    file.on('error', reject)
  })
}

async function main() {
  try {
    const outputDir = path.join(__dirname, '..', 'lib', 'data')
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    console.log('📥 Downloading JMdict Yomitan format...')
    const downloadUrl = 'https://github.com/yomidevs/jmdict-yomitan/releases/latest/download/JMdict_english_with_examples.zip'
    
    const tempDir = os.tmpdir()
    const zipPath = path.join(tempDir, 'jmdict-yomitan.zip')
    
    await downloadFile(downloadUrl, zipPath)

    console.log('📦 Extracting ZIP...')
    const termBanks = []
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(zipPath)
        .pipe(unzipper.Parse())
        .on('entry', (entry) => {
          if (entry.path.startsWith('term_bank_') && entry.path.endsWith('.json')) {
            const chunks = []
            entry.on('data', chunk => chunks.push(chunk))
            entry.on('end', () => {
              try {
                const content = Buffer.concat(chunks).toString('utf8')
                const entries = JSON.parse(content)
                termBanks.push(...entries)
                console.log(`  ✓ Loaded ${entries.length} entries from ${entry.path}`)
              } catch (err) {
                console.warn(`  ⚠️  Error parsing ${entry.path}:`, err.message)
              }
            })
          } else {
            entry.autodrain()
          }
        })
        .on('close', resolve)
        .on('error', reject)
    })

    fs.unlinkSync(zipPath)
    
    const outputFile = path.join(outputDir, 'jmdict.json')
    fs.writeFileSync(outputFile, JSON.stringify(termBanks, null, 0))
    
    const stats = fs.statSync(outputFile)
    console.log(`\n✅ Dictionary saved to: ${outputFile}`)
    console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
    console.log(`   Total entries: ${termBanks.length.toLocaleString()}`)
    
    if (termBanks.length > 0) {
      console.log('\n📝 Sample entry:')
      console.log(JSON.stringify(termBanks[0], null, 2).substring(0, 500))
    }
    
    console.log('\n✅ Done!')
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

main()
