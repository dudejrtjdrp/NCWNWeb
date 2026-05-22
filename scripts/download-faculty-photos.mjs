/**
 * 교수 사진 다운로드 스크립트
 * Figma MCP 스크린샷 URL → public/images/faculty/*.png
 *
 * 사용법: node scripts/download-faculty-photos.mjs
 * ⚠️  URL은 Figma MCP 단기 토큰 (약 7일 유효)
 *     만료 전에 실행하세요.
 */

import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '..', 'public', 'images', 'faculty')

const PHOTOS = [
  {
    name: 'bae-yung-yung',
    url: 'https://www.figma.com/api/mcp/asset/f03e2a03-7c61-4066-b4c4-f1f2fd6d46b4',
  },
  {
    name: 'lee-gwang-soo',
    url: 'https://www.figma.com/api/mcp/asset/0c5e68ad-627e-4b0c-9568-465a1e62fcd2',
  },
  {
    name: 'lee-seock-hee',
    url: 'https://www.figma.com/api/mcp/asset/71687c92-9ec2-4582-a2d1-5b98bc636ea9',
  },
  {
    name: 'lee-ju-heon',
    url: 'https://www.figma.com/api/mcp/asset/3910066f-6fee-4e3b-8443-16292fda708e',
  },
  {
    name: 'ahn-jong-gu',
    url: 'https://www.figma.com/api/mcp/asset/33c03796-c749-49f8-96aa-b990a8920c84',
  },
  {
    name: 'yuk-sim-woong',
    url: 'https://www.figma.com/api/mcp/asset/de0a8bec-65df-4bff-b5aa-3c3dc8639c26',
  },
  {
    name: 'park-min-yu',
    url: 'https://www.figma.com/api/mcp/asset/7675b7d7-ad01-4413-891c-0c6d1a1b82ff',
  },
]

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })
  console.log(`📁 저장 경로: ${OUTPUT_DIR}\n`)

  const results = await Promise.allSettled(
    PHOTOS.map(async ({ name, url }) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      const dest = join(OUTPUT_DIR, `${name}.png`)
      await writeFile(dest, buf)
      console.log(`✅ ${name}.png  (${(buf.length / 1024).toFixed(1)} KB)`)
      return name
    })
  )

  const failed = results.filter((r) => r.status === 'rejected')
  if (failed.length) {
    console.error(`\n❌ 실패 ${failed.length}건:`)
    failed.forEach((r, i) => {
      if (r.status === 'rejected') console.error(`  - ${PHOTOS[i].name}: ${r.reason}`)
    })
    console.error('\n⚠️  URL이 만료됐을 수 있습니다. Cowork에서 다시 다운로드를 요청하세요.')
    process.exit(1)
  }

  console.log('\n🎉 모든 교수 사진 다운로드 완료!')
}

main().catch((e) => { console.error(e); process.exit(1) })
