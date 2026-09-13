import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge 에 프로젝트 커스텀 토큰을 알려준다.
 *
 * ⚠️ 중요: 이걸 하지 않으면 tailwind-merge 가 `text-hero-1` 같은 커스텀 폰트 사이즈를
 * "텍스트 색상"으로 오인해, 같은 cn() 안의 `text-nwcn-text-default` 와 충돌 처리하며
 * 사이즈 클래스를 통째로 지워버린다(히어로 제목이 16px 로 나오던 원인).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'hero-1', 'hero-2', 'page-1', 'section', 'card',
            'body', 'body-sm', 'caption', 'label',
            'display-xl', 'display-lg', 'display-md',
          ],
        },
      ],
      shadow: [{ shadow: ['lift-1', 'lift-2', 'lift-3'] }],
      rounded: [{ rounded: ['card', 'panel', 'hero'] }],
      'max-w': [{ 'max-w': ['page', 'wide'] }],
      duration: [{ duration: ['fast', 'base', 'slow'] }],
      ease: [{ ease: ['nwcn'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatYear(year: number): string {
  return `${year}년`
}
