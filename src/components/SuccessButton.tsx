import React from 'react'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuccessButtonProps {
  children: React.ReactNode
  loading?: boolean
  success?: boolean
  loadingText?: string
  successText?: string
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function SuccessButton({
  children,
  loading = false,
  success = false,
  loadingText,
  successText,
  className,
  variant = 'default',
  size = 'default',
  disabled,
  onClick,
  type = 'button',
  ...props
}: SuccessButtonProps) {
  // Auto-reset success state after 2 seconds
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        // This will be handled by parent component
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      className={cn(
        'transition-all duration-300',
        success && 'bg-green-500 hover:bg-green-600 text-white',
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {success && <Check className="mr-2 h-4 w-4" />}
      {loading && loadingText ? loadingText : 
       success && successText ? successText : 
       children}
    </Button>
  )
} 