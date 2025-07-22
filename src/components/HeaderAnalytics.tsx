'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getTierBadge } from '@/lib/constants'
import type { Contact } from '@/lib/types'
import type { GlobalAnalytics } from '../lib/types';
import { Users, TrendingUp, UserCheck } from 'lucide-react'

interface HeaderAnalyticsProps {
  globalAnalytics: GlobalAnalytics;
}

const HeaderAnalytics = ({ globalAnalytics }: HeaderAnalyticsProps) => {
  // Use globalAnalytics for display
  return (
    <div className="header-analytics">
      <div>Total Contacts: {globalAnalytics.totalContacts}</div>
      <div>Tier 1: {globalAnalytics.tier1Count}</div>
      <div>Tier 2: {globalAnalytics.tier2Count}</div>
      <div>Tier 3: {globalAnalytics.tier3Count}</div>
      {/* Add more analytics as needed */}
    </div>
  );
};

export default HeaderAnalytics;

// Mobile-optimized version for smaller screens
export function HeaderAnalyticsMobile({ contacts }: HeaderAnalyticsProps) {
  const metrics = React.useMemo(() => {
    const total = contacts.length
    const tier1Count = contacts.filter(c => c.tier === 'tier1').length
    const tier2Count = contacts.filter(c => c.tier === 'tier2').length
    const tier3Count = contacts.filter(c => c.tier === 'tier3').length
    
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const recentContacts = contacts.filter(c => {
      const createdAt = new Date(c.createdAt)
      return createdAt > oneWeekAgo
    }).length

    return {
      total,
      tier1Count,
      tier2Count,
      tier3Count,
      recentGrowth: recentContacts
    }
  }, [contacts])

  return (
    <div className="flex items-center gap-2">
      {/* Compact Total */}
      <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
        <Users className="w-3 h-3 mr-1 text-blue-500 dark:text-blue-400" />
        {metrics.total} Total
      </Badge>

      {/* Compact Tier Counts */}
      <div className="flex items-center gap-1">
        <Badge className="bg-pink-500 dark:bg-pink-400 text-white text-xs px-1.5 py-0.5">
          {metrics.tier1Count}
        </Badge>
        <Badge className="bg-yellow-500 dark:bg-yellow-400 text-white text-xs px-1.5 py-0.5">
          {metrics.tier2Count}
        </Badge>
        <Badge className="bg-green-500 dark:bg-green-400 text-white text-xs px-1.5 py-0.5">
          {metrics.tier3Count}
        </Badge>
      </div>

      {/* Growth Indicator */}
      {metrics.recentGrowth > 0 && (
        <Badge className="bg-emerald-500 dark:bg-emerald-400 text-white text-xs px-1.5 py-0.5">
          ↗ +{metrics.recentGrowth}
        </Badge>
      )}
    </div>
  )
} 