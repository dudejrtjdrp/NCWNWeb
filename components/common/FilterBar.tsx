'use client'

import { cn } from '@/lib/utils'

interface FilterBarProps {
  filters: string[]
  activeFilter: string
  onFilterChange: (filter: string) => void
  className?: string
}

export default function FilterBar({ filters, activeFilter, onFilterChange, className }: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={cn(
            'px-4 py-2 rounded-full font-body text-sm font-medium transition-all duration-200',
            activeFilter === filter
              ? 'bg-nwcn-green text-nwcn-dark'
              : 'border border-white/20 text-white/60 hover:border-nwcn-green/40 hover:text-white'
          )}
        >
          {filter}
        </button>
      ))}
    </div>
  )
}
