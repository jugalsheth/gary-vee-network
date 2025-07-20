// Tier color constants and helpers for Gary Vee Network
import type { Tier } from './types'

export const TIER_COLORS = {
  tier1: {
    primary: 'hsl(330 81% 60%)',
    background: 'hsl(330 81% 95%)',
    border: 'border-pink-500',
    classes: 'bg-pink-50 border-l-pink-500 bg-pink-500',
  },
  tier2: {
    primary: 'hsl(48 96% 53%)',
    background: 'hsl(48 96% 95%)',
    border: 'border-yellow-500',
    classes: 'bg-yellow-50 border-l-yellow-500 bg-yellow-500',
  },
  tier3: {
    primary: 'hsl(142 71% 45%)',
    background: 'hsl(142 71% 95%)',
    border: 'border-green-500',
    classes: 'bg-green-50 border-l-green-500 bg-green-500',
  },
}

export const getTierColor = (tier: Tier) => {
  switch (tier) {
    case 'tier1': return 'border-l-pink-500 bg-pink-50 dark:bg-pink-950/20'
    case 'tier2': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
    case 'tier3': return 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
    default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-800'
  }
}

export const getTierBadge = (tier: Tier) => {
  switch (tier) {
    case 'tier1': return 'bg-pink-500 text-white dark:bg-pink-400'
    case 'tier2': return 'bg-yellow-500 text-white dark:bg-yellow-400'
    case 'tier3': return 'bg-green-500 text-white dark:bg-green-400'
    default: return 'bg-gray-500 text-white dark:bg-gray-400'
  }
} 