import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'yellow' | 'outline' | 'gray'
  className?: string
}

export default function Badge({ children, variant = 'outline', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-body tracking-wide',
        {
          'bg-nwcn-green/10 text-nwcn-green border border-nwcn-green/20': variant === 'green',
          'bg-nwcn-yellow/10 text-nwcn-yellow border border-nwcn-yellow/20': variant === 'yellow',
          'bg-transparent text-white/60 border border-white/20': variant === 'outline',
          'bg-white/5 text-white/50 border border-white/10': variant === 'gray',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
