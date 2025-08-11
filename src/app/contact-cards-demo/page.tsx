'use client'

import { ContactCardDemo } from '@/components/ContactCard'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building, Star, Users, Heart, Home } from 'lucide-react'

export default function ContactCardsDemoPage() {
  const [selectedTier, setSelectedTier] = useState<'all' | 'tier1' | 'tier2' | 'tier3'>('all')
  const [selectedType, setSelectedType] = useState<'all' | 'business' | 'influencer' | 'general'>('all')

  const sampleContacts = [
    {
      id: '1',
      name: 'Jane Doe',
      tier: 'tier1' as const,
      email: 'jane@example.com',
      phone: '+1 555-1234',
      relationshipToGary: 'Business Partner',
      hasKids: true,
      isMarried: true,
      location: 'New York, NY',
      interests: ['Marketing', 'Startups', 'Wine'],
      notes: 'Jane is a long-time collaborator and trusted advisor. She has deep expertise in marketing and has helped Gary with several ventures. She has been instrumental in scaling multiple businesses and has a keen eye for market trends.',
      instagram: 'janedoe',
      connections: [{ contactId: '2', strength: 'strong', type: 'business', createdAt: new Date() }],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      contactType: 'business' as const,
      createdBy: 'gary',
    },
    {
      id: '2',
      name: 'Mike Johnson',
      tier: 'tier2' as const,
      email: 'mike@example.com',
      phone: '+1 555-5678',
      relationshipToGary: 'Industry Contact',
      hasKids: false,
      isMarried: true,
      location: 'Los Angeles, CA',
      interests: ['Technology', 'Innovation'],
      notes: 'Mike is a tech entrepreneur with several successful exits. He\'s been a valuable connection in the startup ecosystem.',
      instagram: 'mikejohnson',
      connections: [],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-10'),
      contactType: 'business' as const,
      createdBy: 'gary',
    },
    {
      id: '3',
      name: 'Sarah Wilson',
      tier: 'tier1' as const,
      email: 'sarah@example.com',
      phone: '+1 555-9012',
      relationshipToGary: 'Personal Friend',
      hasKids: true,
      isMarried: false,
      location: 'Miami, FL',
      interests: ['Fitness', 'Wellness', 'Travel'],
      notes: 'Sarah is a close personal friend who has been there through thick and thin. She\'s also a successful fitness entrepreneur.',
      instagram: 'sarahwilson',
      connections: [
        { contactId: '1', strength: 'medium', type: 'business', createdAt: new Date() },
        { contactId: '4', strength: 'strong', type: 'business', createdAt: new Date() }
      ],
      createdAt: new Date('2023-06-15'),
      updatedAt: new Date('2024-01-25'),
      contactType: 'general' as const,
      createdBy: 'gary',
    },
    {
      id: '4',
      name: 'Alex Chen',
      tier: 'tier3' as const,
      email: 'alex@example.com',
      phone: '+1 555-3456',
      relationshipToGary: 'Social Media Influencer',
      hasKids: false,
      isMarried: false,
      location: 'San Francisco, CA',
      interests: ['Social Media', 'Content Creation', 'Fashion'],
      notes: 'Alex is a rising social media star with 500K+ followers. Great for brand collaborations and reaching younger audiences.',
      instagram: 'alexchen',
      connections: [],
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-05'),
      contactType: 'influencer' as const,
      createdBy: 'gary',
    }
  ]

  const filteredContacts = sampleContacts.filter(contact => {
    const tierMatch = selectedTier === 'all' || contact.tier === selectedTier
    const typeMatch = selectedType === 'all' || contact.contactType === selectedType
    return tierMatch && typeMatch
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Enhanced Contact Cards Demo</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Showcasing the improved contact cards with status indicators, tooltips, and quick actions
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tier</label>
                <div className="flex gap-2">
                  {(['all', 'tier1', 'tier2', 'tier3'] as const).map(tier => (
                    <Button
                      key={tier}
                      variant={selectedTier === tier ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTier(tier)}
                    >
                      {tier === 'all' ? 'All Tiers' : `Tier ${tier.slice(-1)}`}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <div className="flex gap-2">
                  {(['all', 'business', 'influencer', 'general'] as const).map(type => (
                    <Button
                      key={type}
                      variant={selectedType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                    >
                      {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>New Features Added</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">✨ Visual Enhancements</h3>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Status Indicators</strong> - Green (Active), Yellow (Recent), Orange (Moderate), Gray (Inactive)</li>
                  <li>• <strong>Contact Type Badges</strong> - Business, Influencer, General with appropriate icons</li>
                  <li>• <strong>Connection Strength</strong> - Visual indicator showing number of connections</li>
                  <li>• <strong>Enhanced Animations</strong> - Smooth hover effects and transitions</li>
                  <li>• <strong>Activity Indicators</strong> - Shows last activity status</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">🎯 Interactive Features</h3>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Tooltips</strong> - Hover over buttons to see actions</li>
                  <li>• <strong>Quick Actions</strong> - Message and Add Connection buttons appear on hover</li>
                  <li>• <strong>Enhanced Notes</strong> - "Read more" for long notes</li>
                  <li>• <strong>Better Hover States</strong> - Improved visual feedback</li>
                  <li>• <strong>Responsive Design</strong> - Works perfectly on all screen sizes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <ContactCardDemo key={contact.id} contact={contact} />
          ))}
        </div>

        {/* Legend */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Status & Type Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Status Indicators</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Active (Last 24 hours)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Recent (Last 7 days)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Moderate (Last 30 days)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-sm">Inactive (30+ days)</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Contact Types</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Business</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Influencer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">General</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Connection Strength</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                    <span className="text-sm">Strong (5+ connections)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                    <span className="text-sm">Medium (3-4 connections)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                    <span className="text-sm">Weak (1-2 connections)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 