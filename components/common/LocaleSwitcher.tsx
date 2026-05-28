'use client'

/**
 * 언어 전환 버튼 (KO / EN)
 * next-intl의 useRouter + usePathname으로 현재 경로를 유지한 채 로케일 전환
 */

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

interface LocaleSwitcherProps {
  /** Header 테마에 따라 텍스트 색상 변경 */
  isLight?: boolean
  className?: string
}

export default function LocaleSwitcher({ isLight = true, className }: LocaleSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleSwitch = (nextLocale: string) => {
    if (nextLocale === locale) return
    router.replace(pathname, { locale: nextLocale })
  }

  const baseText = isLight ? 'text-[#323131]' : 'text-white/70'
  const activeText = 'text-nwcn-green font-semibold'
  const divider = isLight ? 'bg-[#323131]/30' : 'bg-white/20'

  return (
    <div className={cn('flex items-center gap-1 font-body text-[13px]', className)}>
      <button
        onClick={() => handleSwitch('ko')}
        className={cn(
          'transition-colors duration-150 px-1',
          locale === 'ko' ? activeText : `${baseText} hover:text-nwcn-green`
        )}
        aria-label="한국어로 전환"
      >
        KO
      </button>
      <span className={cn('w-[1px] h-[10px]', divider)} aria-hidden="true" />
      <button
        onClick={() => handleSwitch('en')}
        className={cn(
          'transition-colors duration-150 px-1',
          locale === 'en' ? activeText : `${baseText} hover:text-nwcn-green`
        )}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  )
}
