import React from 'react'
import { cn } from '@/lib/utils'

interface ContactAvatarProps {
  name: string
  tier: 'tier1' | 'tier2' | 'tier3'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ContactAvatar({ name, tier, size = 'md', className }: ContactAvatarProps) {
  // Generate initials from name
  const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/)
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase()
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
  }

  // Get tier color classes
  const getTierColor = (tier: 'tier1' | 'tier2' | 'tier3'): string => {
    switch (tier) {
      case 'tier1':
        return 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-200/50'
      case 'tier2':
        return 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg shadow-yellow-200/50'
      case 'tier3':
        return 'bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-lg shadow-green-200/50'
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-200/50'
    }
  }

  // Get size classes
  const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-xs'
      case 'md':
        return 'w-12 h-12 text-sm'
      case 'lg':
        return 'w-16 h-16 text-lg'
      default:
        return 'w-12 h-12 text-sm'
    }
  }

  const initials = getInitials(name)
  const tierColor = getTierColor(tier)
  const sizeClasses = getSizeClasses(size)

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-bold transition-modern hover:scale-110 hover:shadow-xl float',
        tierColor,
        sizeClasses,
        className
      )}
      title={`${name} (${tier.replace('tier', 'Tier ')})`}
    >
      {initials}
    </div>
  )
} 