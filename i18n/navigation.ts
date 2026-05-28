/**
 * next-intl 네비게이션 헬퍼
 * 로케일을 인식하는 Link, useRouter, usePathname, redirect를 export
 */
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, useRouter, usePathname, redirect } = createNavigation(routing)
