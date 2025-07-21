'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getTierBadge } from '@/lib/constants'
import type { Contact } from '@/lib/types'
import { Users, TrendingUp, UserCheck } from 'lucide-react'

interface HeaderAnalyticsProps {
  contacts: Contact[]
}

export function HeaderAnalytics({ contacts }: HeaderAnalyticsProps) {
  // Calculate metrics in real-time
  const metrics = React.useMemo(() => {
    const total = contacts.length
    const tier1Count = contacts.filter(c => c.tier === 'tier1').length
    const tier2Count = contacts.filter(c => c.tier === 'tier2').length
    const tier3Count = contacts.filter(c => c.tier === 'tier3').length
    
    // Calculate growth (contacts added in the last 7 days)
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
    <div className="flex items-center gap-4">
      {/* Total Contacts */}
      <div className="flex items-center gap-2">
        <Card className="glass-card rounded-modern shadow-modern transition-modern hover:shadow-modern-hover">
          <CardContent className="p-3 px-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-500 dark:text-blue-400 breathe" />
              <div>
                <span className="text-lg font-bold gradient-text transition-colors duration-300">
                  {metrics.total}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300 ml-1">
                  Total Contacts
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier 1 Count */}
      <div className="flex items-center gap-2">
        <Card className="glass-card rounded-modern shadow-modern transition-modern hover:shadow-modern-hover">
          <CardContent className="p-3 px-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-pink-500 dark:text-pink-400 breathe" />
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  {metrics.tier1Count}
                </span>
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-2 py-0.5 ml-1 rounded-full">
                  Tier 1
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier 2 Count */}
      <div className="flex items-center gap-2">
        <Card className="glass-card rounded-modern shadow-modern transition-modern hover:shadow-modern-hover">
          <CardContent className="p-3 px-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-yellow-500 dark:text-yellow-400 breathe" />
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  {metrics.tier2Count}
                </span>
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-0.5 ml-1 rounded-full">
                  Tier 2
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier 3 Count */}
      <div className="flex items-center gap-2">
        <Card className="glass-card rounded-modern shadow-modern transition-modern hover:shadow-modern-hover">
          <CardContent className="p-3 px-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-green-500 dark:text-green-400 breathe" />
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  {metrics.tier3Count}
                </span>
                <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs px-2 py-0.5 ml-1 rounded-full">
                  Tier 3
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Indicator */}
      {metrics.recentGrowth > 0 && (
        <div className="flex items-center gap-2">
          <Card className="glass-card rounded-modern shadow-modern transition-modern hover:shadow-modern-hover pulse-glow">
            <CardContent className="p-3 px-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400 breathe" />
                <div>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 transition-colors duration-300">
                    ↗ +{metrics.recentGrowth}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300 ml-1">
                    this week
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

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