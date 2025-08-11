'use client'

import { TabDemo } from '@/components/TabDemo'
import { ViewModeTabs } from '@/components/ViewModeTabs'
import { useState } from 'react'

export default function TabDemoPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'bulk' | 'network' | 'insights'>('grid')
  
  const mockAnalytics = {
    totalContacts: 1247,
    tier1Count: 89,
    tier2Count: 234,
    tier3Count: 924
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Tab System Improvements Demo</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Showcasing the enhanced tab components for Gary Vee Network
          </p>
        </div>

        {/* Current Implementation */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Current Implementation (ViewModeTabs)</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <ViewModeTabs 
              viewMode={viewMode} 
              onViewModeChange={setViewMode}
              analytics={mockAnalytics}
            />
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current view mode: <strong>{viewMode}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Full Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <TabDemo />
        </div>
      </div>
    </div>
  )
} 