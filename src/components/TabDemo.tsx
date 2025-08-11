'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TabGroup, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/enhanced-tabs'
import { Grid, List, Network, BarChart3, Users, Star, Target, TrendingUp, Settings, Bell, User, Mail } from 'lucide-react'

export function TabDemo() {
  const [activeTab, setActiveTab] = React.useState('overview')

  const demoData = {
    totalContacts: 1247,
    tier1Count: 89,
    tier2Count: 234,
    tier3Count: 924
  }

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Enhanced Tab System Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Showcasing improved tab components with better UX and animations
        </p>
      </div>

      {/* Basic Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Tabs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" variant="animated">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">Overview Content</h3>
                <p>This is the overview tab content with smooth animations.</p>
              </div>
            </TabsContent>
            <TabsContent value="analytics" variant="animated">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">Analytics Content</h3>
                <p>Analytics data and charts would go here.</p>
              </div>
            </TabsContent>
            <TabsContent value="settings" variant="animated">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">Settings Content</h3>
                <p>Application settings and configuration options.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Pills Variant */}
      <Card>
        <CardHeader>
          <CardTitle>Pills Variant</CardTitle>
        </CardHeader>
        <CardContent>
          <TabGroup
            tabs={[
              {
                value: 'grid',
                label: 'Grid View',
                icon: <Grid className="w-4 h-4" />,
                content: (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-2">Grid Layout</h3>
                    <p>Card-based contact display with visual hierarchy.</p>
                  </div>
                )
              },
              {
                value: 'list',
                label: 'List View',
                icon: <List className="w-4 h-4" />,
                content: (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-2">List Layout</h3>
                    <p>Compact list view for bulk operations.</p>
                  </div>
                )
              },
              {
                value: 'network',
                label: 'Network',
                icon: <Network className="w-4 h-4" />,
                badge: 'New',
                content: (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-2">Network View</h3>
                    <p>Visual relationship mapping and connections.</p>
                  </div>
                )
              }
            ]}
            variant="pills"
            size="md"
          />
        </CardContent>
      </Card>

      {/* Cards Variant */}
      <Card>
        <CardHeader>
          <CardTitle>Cards Variant (Like ViewModeTabs)</CardTitle>
        </CardHeader>
        <CardContent>
          <TabGroup
            tabs={[
              {
                value: 'grid',
                label: 'Grid View',
                icon: <Grid className="w-4 h-4" />,
                description: 'Card-based display',
                content: (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-2">Grid Layout</h3>
                    <p>Perfect for browsing contacts in a visual format.</p>
                  </div>
                )
              },
              {
                value: 'bulk',
                label: 'Bulk Operations',
                icon: <List className="w-4 h-4" />,
                description: 'Mass management',
                content: (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-2">Bulk Operations</h3>
                    <p>Efficiently manage multiple contacts at once.</p>
                  </div>
                )
              },
              {
                value: 'network',
                label: 'Network',
                icon: <Network className="w-4 h-4" />,
                description: 'Visual mapping',
                content: (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-2">Network View</h3>
                    <p>Explore relationships and connections visually.</p>
                  </div>
                )
              },
              {
                value: 'insights',
                label: 'Analytics',
                icon: <BarChart3 className="w-4 h-4" />,
                description: 'Data insights',
                badge: demoData.totalContacts,
                content: (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-2">Analytics Dashboard</h3>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{demoData.tier1Count}</div>
                        <div className="text-sm text-gray-600">Tier 1</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{demoData.tier2Count}</div>
                        <div className="text-sm text-gray-600">Tier 2</div>
                      </div>
                    </div>
                  </div>
                )
              }
            ]}
            variant="cards"
            size="lg"
            showNavigation={true}
          />
        </CardContent>
      </Card>

      {/* Underline Variant */}
      <Card>
        <CardHeader>
          <CardTitle>Underline Variant</CardTitle>
        </CardHeader>
        <CardContent>
          <TabGroup
            tabs={[
              {
                value: 'profile',
                label: 'Profile',
                icon: <User className="w-4 h-4" />,
                content: (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-2">User Profile</h3>
                    <p>Personal information and preferences.</p>
                  </div>
                )
              },
              {
                value: 'notifications',
                label: 'Notifications',
                icon: <Bell className="w-4 h-4" />,
                badge: 3,
                content: (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-2">Notifications</h3>
                    <p>Manage your notification preferences.</p>
                  </div>
                )
              },
              {
                value: 'messages',
                label: 'Messages',
                icon: <Mail className="w-4 h-4" />,
                content: (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-2">Messages</h3>
                    <p>View and manage your messages.</p>
                  </div>
                )
              }
            ]}
            variant="underline"
            size="md"
          />
        </CardContent>
      </Card>

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Tab System Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">✅ Improved Features</h3>
              <ul className="space-y-2 text-sm">
                <li>• Smooth animations and transitions</li>
                <li>• Multiple visual variants (default, pills, cards, underline)</li>
                <li>• Icon support with proper sizing</li>
                <li>• Badge notifications</li>
                <li>• Description text for better context</li>
                <li>• Keyboard navigation support</li>
                <li>• Responsive design</li>
                <li>• Dark mode compatibility</li>
                <li>• Accessibility features</li>
                <li>• Navigation arrows for mobile</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">🎯 Use Cases</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Default:</strong> Standard tab interfaces</li>
                <li>• <strong>Pills:</strong> Modern, rounded tab design</li>
                <li>• <strong>Cards:</strong> Feature-rich view selectors</li>
                <li>• <strong>Underline:</strong> Clean, minimal navigation</li>
                <li>• <strong>With Icons:</strong> Better visual hierarchy</li>
                <li>• <strong>With Badges:</strong> Notification indicators</li>
                <li>• <strong>With Navigation:</strong> Mobile-friendly controls</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 