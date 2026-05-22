/**
 * UI 컴포넌트: Button
 * Figma node-id: 91:58 (Button)
 *
 * 디자인 스펙:
 * - Primary: #09F593 bg, #151515 text / Hover: #133728 bg, #09F593 text
 * - Secondary: #E3E94D bg, #050505 text / Hover: #1D1E00 bg, #E3E94D text
 * - Ghost: border #050505, #050505 text / Hover: #cacaca bg, white text
 * - 공통: Pretendard Bold 16px, px-[24px] py-[12px]
 *
 * 기존 variant 호환:
 * - 'outline' → 'secondary' 동일 처리 (하위 호환)
 */

import Link from 'next/link'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  external?: boolean
  children: React.ReactNode
}

const variants: Record<ButtonVariant, string> = {
  // Figma Primary: #09F593 bg, dark text / Hover: #133728 bg, green text
  primary:
    'bg-nwcn-green text-nwcn-dark font-semibold ' +
    'hover:bg-[#133728] hover:text-nwcn-green',
  // Figma Secondary: #E3E94D bg, dark text / Hover: #1D1E00 bg, yellow text
  secondary:
    'bg-nwcn-yellow text-nwcn-text-default font-semibold ' +
    'hover:bg-[#1D1E00] hover:text-nwcn-yellow',
  // Figma Ghost: border #050505, dark text / Hover: #cacaca bg, white text
  ghost:
    'border border-nwcn-text-default text-nwcn-text-default font-semibold ' +
    'hover:bg-[#cacaca] hover:text-white',
  // 하위 호환: outline → secondary 동일 스타일
  outline:
    'bg-nwcn-yellow text-nwcn-text-default font-semibold ' +
    'hover:bg-[#1D1E00] hover:text-nwcn-yellow',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-[16px] py-[8px] text-[13px]',
  md: 'px-[24px] py-[12px] text-[16px]',
  lg: 'px-[32px] py-[14px] text-[16px]',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  external,
  children,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center gap-2 font-body transition-all duration-200 active:scale-95',
    variants[variant],
    sizes[size],
    className
  )

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      )
    }
    return <Link href={href} className={classes}>{children}</Link>
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
