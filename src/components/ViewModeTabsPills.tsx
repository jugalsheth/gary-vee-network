'use client'

import * as React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Grid, List, Network, BarChart3, Users, Star, Target, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ViewModeTabsPillsProps {
  viewMode: 'grid' | 'bulk' | 'network' | 'insights'
  onViewModeChange: (mode: 'grid' | 'bulk' | 'network' | 'insights') => void
  className?: string
  showBadge?: boolean
  badgeText?: string
}

const viewModes = [
  {
    value: 'grid',
    label: 'Grid View',
    icon: Grid,
    color: 'from-blue-500 to-blue-600',
    activeColor: 'bg-blue-500'
  },
  {
    value: 'bulk',
    label: 'List View',
    icon: List,
    color: 'from-green-500 to-green-600',
    activeColor: 'bg-green-500'
  },
  {
    value: 'network',
    label: 'Network',
    icon: Network,
    color: 'from-purple-500 to-purple-600',
    activeColor: 'bg-purple-500'
  },
  {
    value: 'insights',
    label: 'Analytics',
    icon: BarChart3,
    color: 'from-orange-500 to-orange-600',
    activeColor: 'bg-orange-500'
  }
] as const

export function ViewModeTabsPills({ 
  viewMode, 
  onViewModeChange, 
  className,
  showBadge = false,
  badgeText = "New"
}: ViewModeTabsPillsProps) {
  return (
    <Tabs 
      value={viewMode} 
      onValueChange={(value) => onViewModeChange(value as any)}
      className={cn("w-full", className)}
    >
      <TabsList className="inline-flex h-10 items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-800/80 p-1 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
        {viewModes.map((mode) => {
          const Icon = mode.icon
          const isActive = viewMode === mode.value
          const showBadgeForThisTab = showBadge && mode.value === 'network' // Show badge on Network tab
          
          return (
            <TabsTrigger
              key={mode.value}
              value={mode.value}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ease-out",
                "text-sm font-medium whitespace-nowrap",
                "data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md data-[state=active]:scale-105",
                "data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400",
                "data-[state=inactive]:hover:bg-gray-50 dark:data-[state=inactive]:hover:bg-gray-700/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                "dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100 dark:data-[state=active]:shadow-lg",
                "dark:data-[state=active]:border dark:data-[state=active]:border-gray-700"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-md flex items-center justify-center transition-all duration-200",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:shadow-sm",
                mode.color,
                "data-[state=inactive]:bg-gray-200 dark:data-[state=inactive]:bg-gray-700"
              )}>
                <Icon className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="font-medium">{mode.label}</span>
              
              {/* Badge */}
              {showBadgeForThisTab && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] flex items-center justify-center font-medium shadow-sm">
                  {badgeText}
                </div>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}

// Enhanced version with analytics
interface EnhancedViewModeTabsPillsProps extends ViewModeTabsPillsProps {
  analytics?: {
    totalContacts?: number
    tier1Count?: number
    tier2Count?: number
    tier3Count?: number
  }
}

export function EnhancedViewModeTabsPills({ 
  viewMode, 
  onViewModeChange, 
  analytics, 
  className,
  showBadge = false,
  badgeText = "New"
}: EnhancedViewModeTabsPillsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <Tabs 
        value={viewMode} 
        onValueChange={(value) => onViewModeChange(value as any)}
        className="w-full"
      >
        <TabsList className="inline-flex h-10 items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-800/80 p-1 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
          {viewModes.map((mode) => {
            const Icon = mode.icon
            const showBadgeForThisTab = showBadge && mode.value === 'network'
            
            return (
              <TabsTrigger
                key={mode.value}
                value={mode.value}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ease-out",
                  "text-sm font-medium whitespace-nowrap",
                  "data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md data-[state=active]:scale-105",
                  "data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400",
                  "data-[state=inactive]:hover:bg-gray-50 dark:data-[state=inactive]:hover:bg-gray-700/50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                  "dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100 dark:data-[state=active]:shadow-lg",
                  "dark:data-[state=active]:border dark:data-[state=active]:border-gray-700"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-md flex items-center justify-center transition-all duration-200",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:shadow-sm",
                  mode.color,
                  "data-[state=inactive]:bg-gray-200 dark:data-[state=inactive]:bg-gray-700"
                )}>
                  <Icon className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="font-medium">{mode.label}</span>
                
                {/* Badge */}
                {showBadgeForThisTab && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] flex items-center justify-center font-medium shadow-sm">
                    {badgeText}
                  </div>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
      
      {/* Analytics bar - more compact for pills */}
      {analytics && (
        <div className="flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 rounded-full px-4 py-2 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{analytics.totalContacts || 0}</span>
          </div>
          <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-pink-500" />
            <span>{analytics.tier1Count || 0}</span>
          </div>
          <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-yellow-500" />
            <span>{analytics.tier2Count || 0}</span>
          </div>
          <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span>{analytics.tier3Count || 0}</span>
          </div>
        </div>
      )}
    </div>
  )
} 