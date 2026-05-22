import { cn } from '@/lib/utils'

interface PageHeaderProps {
  category: string
  title: string
  description?: string
  className?: string
}

export default function PageHeader({ category, title, description, className }: PageHeaderProps) {
  return (
    <section className={cn('pt-32 pb-16 border-b border-white/10', className)}>
      <div className="page-container">
        <p className="font-body text-xs font-semibold tracking-widest text-nwcn-green mb-4">
          {category}
        </p>
        <h1 className="font-brand text-display-lg text-white mb-4">
          {title}
        </h1>
        {description && (
          <p className="font-body text-base text-white/50 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
