import * as React from 'react'
import { cn } from '../../lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn('h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100', className)}
      {...props}
    >
      {children}
    </select>
  )
})
Select.displayName = 'Select'


