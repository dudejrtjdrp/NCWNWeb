/**
 * Linkify — 글 속 주소(https://… 또는 www.site.com, chick-hobby.vercel.app 같은 맨 도메인)를 새 창 링크로 바꿔 보여 준다.
 * 훅 없이 작성해 서버·클라이언트 어디서나 쓴다. 이메일(@ 뒤)이나 'Next.js' 같은 이름은 건드리지 않는다.
 */

import { Fragment } from 'react'

const URL_RE =
  /(https?:\/\/[^\s,，)）<]+|(?:www\.)?[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|app|dev|kr|me|site|ai|xyz|so|page|link|studio|design)(?:\/[^\s,，)）<가-힣]*)?)/gi

export default function Linkify({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(URL_RE)) {
    const i = m.index ?? 0
    const prev = text[i - 1] ?? ''
    if (/[@\w.-]/.test(prev)) continue // 이메일·긴 단어 중간
    const raw = m[0].replace(/[.,!?…]+$/, '')
    if (!raw.includes('.') || /^\d+(\.\d+)+$/.test(raw)) continue
    parts.push(text.slice(last, i))
    const href = /^https?:\/\//.test(raw) ? raw : `https://${raw}`
    parts.push(
      <a
        key={i}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all underline decoration-1 underline-offset-4 transition-colors duration-fast ease-nwcn hover:text-nwcn-green-darker"
      >
        {raw}
      </a>
    )
    last = i + raw.length
  }
  if (!parts.length) return <>{text}</>
  parts.push(text.slice(last))
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </>
  )
}
