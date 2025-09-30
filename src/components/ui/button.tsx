import * as React from 'react'
import { cn } from '../../lib/utils'

type Variant = 'default' | 'outline' | 'ghost'
type Size = 'default' | 'sm' | 'lg' | 'icon'

function buttonClassNames(variant: Variant = 'default', size: Size = 'default') {
  const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 disabled:pointer-events-none gap-2 shadow-md'
  const variants: Record<Variant, string> = {
    default: 'bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-600',
    outline: 'border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800',
    ghost: 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100',
  }
  const sizes: Record<Size, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 w-10',
  }
  return cn(base, variants[variant], sizes[size])
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  return (
    <button ref={ref} className={cn(buttonClassNames(variant, size), className)} {...props} />
  )
})
Button.displayName = 'Button'


