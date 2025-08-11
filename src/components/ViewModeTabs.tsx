'use client'

import * as React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Grid, List, Network, BarChart3, Users, Star, Target, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ViewModeTabsProps {
  viewMode: 'grid' | 'bulk' | 'network' | 'insights'
  onViewModeChange: (mode: 'grid' | 'bulk' | 'network' | 'insights') => void
  className?: string
}

const viewModes = [
  {
    value: 'grid',
    label: 'Grid View',
    icon: Grid,
    description: 'Card-based contact display',
    color: 'from-blue-500 to-blue-600',
    activeColor: 'bg-blue-500'
  },
  {
    value: 'bulk',
    label: 'Bulk Operations',
    icon: List,
    description: 'Mass contact management',
    color: 'from-green-500 to-green-600',
    activeColor: 'bg-green-500'
  },
  {
    value: 'network',
    label: 'Network',
    icon: Network,
    description: 'Visual relationship mapping',
    color: 'from-purple-500 to-purple-600',
    activeColor: 'bg-purple-500'
  },
  {
    value: 'insights',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Network insights & metrics',
    color: 'from-orange-500 to-orange-600',
    activeColor: 'bg-orange-500'
  }
] as const

export function ViewModeTabs({ viewMode, onViewModeChange, className }: ViewModeTabsProps) {
  return (
    <Tabs 
      value={viewMode} 
      onValueChange={(value) => onViewModeChange(value as any)}
      className={cn("w-full", className)}
    >
      <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-gray-100/50 dark:bg-gray-800/50 p-1 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        {viewModes.map((mode) => {
          const Icon = mode.icon
          return (
            <TabsTrigger
              key={mode.value}
              value={mode.value}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ease-out",
                "text-sm font-medium whitespace-nowrap",
                "data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:scale-[1.02]",
                "data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400",
                "data-[state=inactive]:hover:bg-gray-50 dark:data-[state=inactive]:hover:bg-gray-700/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                "dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100 dark:data-[state=active]:shadow-lg"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:shadow-sm",
                mode.color,
                "data-[state=inactive]:bg-gray-200 dark:data-[state=inactive]:bg-gray-700"
              )}>
                <Icon className="w-3 h-3 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium">{mode.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  {mode.description}
                </span>
              </div>
              {/* Active indicator */}
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:opacity-100 data-[state=inactive]:opacity-0",
                mode.color
              )} />
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}

// Enhanced version with analytics badges
interface EnhancedViewModeTabsProps extends ViewModeTabsProps {
  analytics?: {
    totalContacts?: number
    tier1Count?: number
    tier2Count?: number
    tier3Count?: number
  }
}

export function EnhancedViewModeTabs({ viewMode, onViewModeChange, analytics, className }: EnhancedViewModeTabsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <Tabs 
        value={viewMode} 
        onValueChange={(value) => onViewModeChange(value as any)}
        className="w-full"
      >
        <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-gray-100/50 dark:bg-gray-800/50 p-1 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          {viewModes.map((mode) => {
            const Icon = mode.icon
            return (
              <TabsTrigger
                key={mode.value}
                value={mode.value}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ease-out",
                  "text-sm font-medium whitespace-nowrap",
                  "data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:scale-[1.02]",
                  "data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400",
                  "data-[state=inactive]:hover:bg-gray-50 dark:data-[state=inactive]:hover:bg-gray-700/50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                  "dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100 dark:data-[state=active]:shadow-lg"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:shadow-sm",
                  mode.color,
                  "data-[state=inactive]:bg-gray-200 dark:data-[state=inactive]:bg-gray-700"
                )}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{mode.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    {mode.description}
                  </span>
                </div>
                {/* Analytics badges */}
                {analytics && mode.value === 'insights' && (
                  <div className="absolute -top-1 -right-1 flex gap-0.5">
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                )}
                {/* Active indicator */}
                <div className={cn(
                  "absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:opacity-100 data-[state=inactive]:opacity-0",
                  mode.color
                )} />
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
      
      {/* Quick stats bar - more subtle */}
      {analytics && (
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg px-3 py-2 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{analytics.totalContacts || 0} total</span>
          </div>
          <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-pink-500" />
            <span>{analytics.tier1Count || 0} tier 1</span>
          </div>
          <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-yellow-500" />
            <span>{analytics.tier2Count || 0} tier 2</span>
          </div>
          <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span>{analytics.tier3Count || 0} tier 3</span>
          </div>
        </div>
      )}
    </div>
  )
} 