/**
 * 글로벌 네비게이션 아이템 — 단일 소스
 * Header, MobileMenu 등 모든 네비게이션 관련 컴포넌트에서 이 파일을 import
 */

export interface NavChild {
  label: string
  href: string
}

export interface NavItem {
  label: string
  href: string
  children: NavChild[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'WORK',
    href: '/work/showcase',
    children: [
      { label: 'SHOWCASE', href: '/work/showcase' },
      { label: 'ARCHIVE', href: '/work/archive' },
    ],
  },
  {
    label: 'ABOUT',
    href: '/about/department',
    children: [
      { label: 'DEPARTMENT', href: '/about/department' },
      { label: 'FACULTY', href: '/about/faculty' },
      { label: 'CURRICULUM', href: '/about/curriculum' },
      { label: 'LAB', href: '/about/lab' },
    ],
  },
  {
    label: 'NINC',
    href: '/ninc/awards',
    children: [
      { label: 'AWARDS', href: '/ninc/awards' },
      { label: 'PROJECT', href: '/ninc/project' },
      { label: 'EVENT', href: '/ninc/event' },
    ],
  },
  {
    label: 'NCR TREND',
    href: '/ncr-trend/latest',
    children: [
      { label: 'LATEST REPORT', href: '/ncr-trend/latest' },
      { label: 'ARCHIVE', href: '/ncr-trend/archive' },
    ],
  },
  {
    label: 'INFO',
    href: '/info/admission',
    children: [
      { label: 'ADMISSION', href: '/info/admission' },
      { label: 'CONTACT', href: '/info/contact' },
      { label: 'PRIVACY', href: '/info/privacy' },
    ],
  },
]

/** ABOUT 서브탭 */
export const ABOUT_NAV_ITEMS: NavChild[] = [
  { label: 'DEPARTMENT', href: '/about/department' },
  { label: 'FACULTY', href: '/about/faculty' },
  { label: 'CURRICULUM', href: '/about/curriculum' },
  { label: 'LAB', href: '/about/lab' },
]

/** NINC 서브탭 */
export const NINC_NAV_ITEMS: NavChild[] = [
  { label: 'AWARDS', href: '/ninc/awards' },
  { label: 'PROJECT', href: '/ninc/project' },
  { label: 'EVENT', href: '/ninc/event' },
]

/** WORK 서브탭 */
export const WORK_NAV_ITEMS: NavChild[] = [
  { label: 'SHOWCASE', href: '/work/showcase' },
  { label: 'ARCHIVE', href: '/work/archive' },
]

/** NCR TREND 서브탭 */
export const NCR_NAV_ITEMS: NavChild[] = [
  { label: 'LATEST REPORT', href: '/ncr-trend/latest' },
  { label: 'ARCHIVE', href: '/ncr-trend/archive' },
]

/** INFO 서브탭 */
export const INFO_NAV_ITEMS: NavChild[] = [
  { label: 'ADMISSION', href: '/info/admission' },
  { label: 'CONTACT', href: '/info/contact' },
  { label: 'PRIVACY', href: '/info/privacy' },
]
