import Link from 'next/link'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  external?: boolean
  children: React.ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-nwcn-green text-nwcn-dark font-semibold hover:bg-nwcn-yellow hover:scale-105',
  outline: 'border border-nwcn-green text-nwcn-green hover:bg-nwcn-green hover:text-nwcn-dark',
  ghost: 'text-white/60 hover:text-white hover:bg-white/5',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
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
    'inline-flex items-center gap-2 rounded-full font-body transition-all duration-200 active:scale-95',
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
