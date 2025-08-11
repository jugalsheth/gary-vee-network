'use client'

import { ViewModeTabsPills, EnhancedViewModeTabsPills } from '@/components/ViewModeTabsPills'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PillsDemoPage() {
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
          <h1 className="text-4xl font-bold mb-4">Pills Tab System Demo</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Clean, modern pills variant with perfect light/dark theme support
          </p>
        </div>

        {/* Basic Pills Version */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Basic Pills Version</CardTitle>
          </CardHeader>
          <CardContent>
            <ViewModeTabsPills 
              viewMode={viewMode} 
              onViewModeChange={setViewMode}
              showBadge={true}
              badgeText="New"
            />
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current view mode: <strong>{viewMode}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Pills Version with Analytics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enhanced Pills with Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedViewModeTabsPills 
              viewMode={viewMode} 
              onViewModeChange={setViewMode}
              analytics={mockAnalytics}
              showBadge={true}
              badgeText="Hot"
            />
          </CardContent>
        </Card>

        {/* Customization Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Customization Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">✨ Features</h3>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Rounded pills design</strong> - Modern, clean look</li>
                  <li>• <strong>Perfect light/dark theme</strong> - Automatic adaptation</li>
                  <li>• <strong>Badge support</strong> - Show notifications</li>
                  <li>• <strong>Smooth animations</strong> - 200ms transitions</li>
                  <li>• <strong>Hover effects</strong> - Interactive feedback</li>
                  <li>• <strong>Analytics integration</strong> - Live data display</li>
                  <li>• <strong>Backdrop blur</strong> - Modern glass effect</li>
                  <li>• <strong>Responsive design</strong> - Mobile optimized</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">🎨 Styling</h3>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Height:</strong> h-10 (compact)</li>
                  <li>• <strong>Border radius:</strong> rounded-full (pills)</li>
                  <li>• <strong>Background:</strong> Semi-transparent with blur</li>
                  <li>• <strong>Active state:</strong> White background with shadow</li>
                  <li>• <strong>Icons:</strong> 16x16px with gradients</li>
                  <li>• <strong>Text:</strong> Medium weight, responsive</li>
                  <li>• <strong>Badge:</strong> Red pill with white text</li>
                  <li>• <strong>Analytics:</strong> Compact rounded bar</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 