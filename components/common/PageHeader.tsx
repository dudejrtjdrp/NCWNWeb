import { cn } from '@/lib/utils'
import AnimateOnScroll from '@/components/common/AnimateOnScroll'

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
        <AnimateOnScroll variant="fade-up" delay={0}>
          <p className="font-body text-xs font-semibold tracking-widest text-nwcn-green mb-4">
            {category}
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll variant="fade-up" delay={80}>
          <h1 className="font-brand text-display-lg text-white mb-4">
            {title}
          </h1>
        </AnimateOnScroll>
        {description && (
          <AnimateOnScroll variant="fade-up" delay={160}>
            <p className="font-body text-base text-white/50 max-w-2xl leading-relaxed">
              {description}
            </p>
          </AnimateOnScroll>
        )}
      </div>
    </section>
  )
}
