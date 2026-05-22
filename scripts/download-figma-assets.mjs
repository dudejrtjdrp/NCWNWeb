/**
 * Figma 에셋 로컬 다운로드 스크립트
 * 실행: node scripts/download-figma-assets.mjs
 *
 * ※ Figma 에셋 URL은 7일간만 유효합니다.
 *    만료 전에 이 스크립트를 실행해 /public/images/department/ 에 저장해두세요.
 */

import { createWriteStream, mkdirSync } from 'fs'
import { get } from 'https'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const ASSETS = [
  // Department 섹션
  { name: 'arrow-vec.png',         url: 'https://www.figma.com/api/mcp/asset/09374d56-3c93-483b-9f5b-85da240e7072' },
  { name: 'symbol-card-bg.png',    url: 'https://www.figma.com/api/mcp/asset/578ab911-ce7c-449c-8dd7-14b1b3a0a557' },
  { name: 'symbol-card-inner.png', url: 'https://www.figma.com/api/mcp/asset/705fd93d-72c4-41ca-b9cd-4997fb94e36d' },
  { name: 'vec-goal.png',          url: 'https://www.figma.com/api/mcp/asset/7b7181be-2500-451e-817d-ba05b9c4cc30' },
  { name: 'goal-card.png',         url: 'https://www.figma.com/api/mcp/asset/46a37e1f-85f9-4662-ba62-0664aefc77f2' },
  { name: 'policy-img1.png',       url: 'https://www.figma.com/api/mcp/asset/86f66205-cc70-4137-8535-2c3697710891' },
  { name: 'policy-img2.png',       url: 'https://www.figma.com/api/mcp/asset/22926ce3-b9c7-47e2-bbb0-8ec1134c6163' },
  { name: 'vec-career.png',        url: 'https://www.figma.com/api/mcp/asset/7bca1e57-ece0-460f-868a-453c635b6075' },
  { name: 'cert-bg.png',           url: 'https://www.figma.com/api/mcp/asset/8aa6d079-94af-44f7-b662-73bf4cc50201' },
  // AboutHero 섹션
  { name: 'nwcn-logo.png',         url: 'https://www.figma.com/api/mcp/asset/989d06ed-aa0f-426d-bac1-858b00087636' },
  { name: 'line2.png',             url: 'https://www.figma.com/api/mcp/asset/570067b9-08b4-49ed-b661-8ef17738deeb' },
]

const OUT_DIR = join(ROOT, 'public', 'images', 'department')
mkdirSync(OUT_DIR, { recursive: true })

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest)
    get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close()
        download(res.headers.location, dest).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        return
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', reject)
  })
}

console.log(`📁 저장 경로: ${OUT_DIR}\n`)

for (const asset of ASSETS) {
  const dest = join(OUT_DIR, asset.name)
  process.stdout.write(`⬇️  ${asset.name} ...`)
  try {
    await download(asset.url, dest)
    console.log(' ✅')
  } catch (e) {
    console.log(` ❌ ${e.message}`)
  }
}

console.log('\n✨ 완료! 이제 Figma URL 대신 /images/department/ 경로를 사용합니다.')
