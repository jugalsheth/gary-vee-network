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
  const getInitials = (name?: string): string => {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
  }

  // Get tier color classes
  const getTierColor = (tier: 'tier1' | 'tier2' | 'tier3'): string => {
    switch (tier) {
      case 'tier1':
        return 'tier-gradient-1 text-white shadow-premium'
      case 'tier2':
        return 'tier-gradient-2 text-white shadow-premium'
      case 'tier3':
        return 'tier-gradient-3 text-white shadow-premium'
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-premium'
    }
  }

  // Get size classes
  const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
    switch (size) {
      case 'sm':
        return 'avatar-sm'
      case 'md':
        return 'avatar-md'
      case 'lg':
        return 'avatar-lg'
      default:
        return 'avatar-md'
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
      title={`${name ?? ''} (${tier ? tier.replace('tier', 'Tier ') : ''})`}
    >
      {initials}
    </div>
  )
} 