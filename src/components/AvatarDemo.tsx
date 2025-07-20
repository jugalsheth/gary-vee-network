import React from 'react'
import { ContactAvatar } from './ContactAvatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AvatarDemo() {
  const demoContacts = [
    { name: 'Jane Doe', tier: 'tier1' as const },
    { name: 'Carlos Rivera', tier: 'tier2' as const },
    { name: 'Lisa Green', tier: 'tier3' as const },
    { name: 'Gary Vaynerchuk', tier: 'tier1' as const },
    { name: 'Priya Patel', tier: 'tier2' as const },
    { name: 'Jugal Sheth', tier: 'tier3' as const },
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Contact Avatar Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Size Variations */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Size Variations</h3>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <ContactAvatar name="Jane Doe" tier="tier1" size="sm" />
              <p className="text-xs text-gray-500 mt-1">Small (32px)</p>
            </div>
            <div className="text-center">
              <ContactAvatar name="Carlos Rivera" tier="tier2" size="md" />
              <p className="text-xs text-gray-500 mt-1">Medium (48px)</p>
            </div>
            <div className="text-center">
              <ContactAvatar name="Lisa Green" tier="tier3" size="lg" />
              <p className="text-xs text-gray-500 mt-1">Large (64px)</p>
            </div>
          </div>
        </div>

        {/* Tier Colors */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Tier Color Coding</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {demoContacts.map((contact, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <ContactAvatar name={contact.name} tier={contact.tier} size="md" />
                <div>
                  <p className="font-medium text-sm">{contact.name}</p>
                  <p className="text-xs text-gray-500">
                    {contact.tier === 'tier1' ? 'Tier 1 (Pink)' : 
                     contact.tier === 'tier2' ? 'Tier 2 (Yellow)' : 'Tier 3 (Green)'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Initial Generation Examples */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Initial Generation Examples</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <ContactAvatar name="John Smith" tier="tier1" size="md" />
              <p className="text-xs text-gray-500 mt-1">"John Smith" → "JS"</p>
            </div>
            <div className="text-center">
              <ContactAvatar name="Mary" tier="tier2" size="md" />
              <p className="text-xs text-gray-500 mt-1">"Mary" → "M"</p>
            </div>
            <div className="text-center">
              <ContactAvatar name="Dr. Sarah Johnson" tier="tier3" size="md" />
              <p className="text-xs text-gray-500 mt-1">"Dr. Sarah Johnson" → "DJ"</p>
            </div>
            <div className="text-center">
              <ContactAvatar name="O'Connor" tier="tier1" size="md" />
              <p className="text-xs text-gray-500 mt-1">"O'Connor" → "O"</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 