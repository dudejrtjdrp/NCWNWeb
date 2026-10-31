/**
 * 한글 이름 → 로마자 (주소 slug 용)
 * - 성은 흔히 쓰는 표기(김 kim, 이 lee, 박 park …), 이름은 국어의 로마자 표기법을 글자 단위로(음운 변화 없이).
 *   예: 이성효 → lee-seonghyo, 김민경 → kim-mingyeong
 * - 한글이 아닌 글자는 그대로 소문자로 두고, 주소에 못 쓰는 글자는 '-' 로 바꾼다.
 */

const INITIAL = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h']
const MEDIAL = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i']
const FINAL = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't']

/** 흔한 성 표기 (두 글자 성 먼저) */
const SURNAMES: Record<string, string> = {
  남궁: 'namgung', 황보: 'hwangbo', 제갈: 'jegal', 선우: 'sunwoo', 독고: 'dokgo', 사공: 'sagong', 서문: 'seomun',
  김: 'kim', 이: 'lee', 박: 'park', 최: 'choi', 정: 'jung', 강: 'kang', 조: 'cho', 윤: 'yoon', 장: 'jang', 임: 'lim',
  한: 'han', 오: 'oh', 서: 'seo', 신: 'shin', 권: 'kwon', 황: 'hwang', 안: 'ahn', 송: 'song', 류: 'ryu', 유: 'yoo',
  홍: 'hong', 전: 'jeon', 고: 'ko', 문: 'moon', 양: 'yang', 손: 'son', 배: 'bae', 백: 'baek', 허: 'heo', 남: 'nam',
  심: 'shim', 노: 'noh', 하: 'ha', 곽: 'kwak', 성: 'sung', 차: 'cha', 주: 'joo', 우: 'woo', 구: 'koo', 민: 'min',
  나: 'na', 진: 'jin', 지: 'ji', 엄: 'eom', 채: 'chae', 원: 'won', 천: 'cheon', 방: 'bang', 공: 'kong', 현: 'hyun',
  변: 'byun', 염: 'yeom', 여: 'yeo', 추: 'choo', 도: 'do', 소: 'so', 석: 'seok', 선: 'sun', 설: 'seol', 마: 'ma',
  길: 'gil', 연: 'yeon', 위: 'wi', 표: 'pyo', 명: 'myung', 기: 'ki', 반: 'ban', 왕: 'wang', 금: 'keum', 옥: 'ok',
  육: 'yook', 인: 'in', 맹: 'maeng', 제: 'je', 모: 'mo', 탁: 'tak', 국: 'kook', 은: 'eun', 편: 'pyeon', 용: 'yong',
  예: 'ye', 경: 'kyung', 봉: 'bong', 태: 'tae', 목: 'mok', 형: 'hyung', 두: 'doo', 감: 'kam', 동: 'dong', 호: 'ho',
}

/** 한글 음절을 글자 단위로 로마자로 */
export function romanizeHangul(text: string): string {
  let out = ''
  for (const ch of text.normalize('NFC')) {
    const code = ch.charCodeAt(0) - 0xac00
    if (code < 0 || code > 11171) {
      out += ch
      continue
    }
    out += INITIAL[Math.floor(code / 588)] + MEDIAL[Math.floor((code % 588) / 28)] + FINAL[code % 28]
  }
  return out
}

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** 이름 → 주소용 로마자 (예: 이성효 → lee-seonghyo). 영문 이름이 있으면 그걸 쓴다 */
export function nameSlug(name: string, nameEn?: string | null): string {
  if (nameEn?.trim()) return toSlug(nameEn)
  const n = name.normalize('NFC').replace(/\s+/g, '')
  const two = n.slice(0, 2)
  if (n.length >= 3 && SURNAMES[two]) return toSlug(`${SURNAMES[two]}-${romanizeHangul(n.slice(2))}`)
  const one = n.slice(0, 1)
  if (n.length >= 2 && SURNAMES[one]) return toSlug(`${SURNAMES[one]}-${romanizeHangul(n.slice(1))}`)
  return toSlug(romanizeHangul(n))
}
