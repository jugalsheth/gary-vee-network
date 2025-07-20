'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTierColor, getTierBadge } from "@/lib/constants"
import type { Contact } from "@/lib/types"
import { Mail, Phone, Users, User, Baby, Heart, Network, Shield, Volume2 } from "lucide-react"
import * as React from "react"
import { useAuth } from "./AuthProvider"
import { canSeeField, canEditContact, canDeleteContact } from "@/lib/auth"
import { ContactAvatar } from "./ContactAvatar"

export interface ContactCardProps {
  contact: Contact
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
  onManageConnections?: (contact: Contact) => void
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete, onManageConnections }) => {
  const { user } = useAuth()
  const tierColor = getTierColor(contact.tier)
  const tierBadge = getTierBadge(contact.tier)
  
  // Permission checks
  const canSeePhone = canSeeField(user, 'phone', contact.tier)
  const canEdit = canEditContact(user, contact.tier)
  const canDelete = canDeleteContact(user)
  
  return (
    <Card
      className={`relative flex flex-col gap-4 p-6 shadow-md border-l-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg dark:shadow-gray-900/20 ${tierColor}`}
    >
      {/* Main Content Area */}
      <div className="flex items-start gap-4">
        {/* Contact Avatar */}
        <ContactAvatar 
          name={contact.name} 
          tier={contact.tier} 
          size="md" 
          className="flex-shrink-0"
        />
        
        {/* Contact Information */}
        <div className="flex-1 min-w-0">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                {contact.name}
              </CardTitle>
              <Badge className={`text-xs font-semibold px-2 py-1 rounded ${tierBadge}`}>
                {contact.tier === 'tier1' ? 'Tier 1' : contact.tier === 'tier2' ? 'Tier 2' : 'Tier 3'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
            <div className="flex flex-wrap gap-4">
              {contact.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                  {contact.email}
                </span>
              )}
              {contact.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                  {canSeePhone ? (
                    contact.phone
                  ) : (
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Shield className="w-3 h-3" />
                      [Restricted]
                    </span>
                  )}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                {contact.relationshipToGary}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1">
                <Baby className={`w-4 h-4 ${contact.hasKids ? 'text-green-500 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'} transition-colors duration-300`} />
                {contact.hasKids ? 'Has kids' : 'No kids'}
              </span>
              <span className="flex items-center gap-1">
                <Heart className={`w-4 h-4 ${contact.isMarried ? 'text-pink-500 dark:text-pink-400' : 'text-gray-300 dark:text-gray-600'} transition-colors duration-300`} />
                {contact.isMarried ? 'Married' : 'Not married'}
              </span>
              {contact.location && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 inline-block transition-colors duration-300" />
                  {contact.location}
                </span>
              )}
              {contact.hasVoiceNotes && (
                <span className="flex items-center gap-1">
                  <Volume2 className="w-4 h-4 text-blue-500 dark:text-blue-400 transition-colors duration-300" />
                  <span className="text-blue-600 dark:text-blue-400 text-xs">Voice notes</span>
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(contact.interests || []).map((interest, i) => (
                <Badge 
                  key={i} 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-colors duration-300"
                >
                  {interest}
                </Badge>
              ))}
            </div>
            
            <div className="mt-2 text-gray-600 dark:text-gray-400 italic truncate transition-colors duration-300" title={contact.notes}>
              {(contact.notes || '').length > 100 ? (contact.notes || '').slice(0, 100) + '…' : contact.notes || ''}
            </div>
          </CardContent>
        </div>
      </div>
      
      {/* Action Buttons - Bottom Right */}
      <div className="flex items-center justify-end gap-2 flex-wrap">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onManageConnections?.(contact)} 
          aria-label="Manage connections"
        >
          <Network className="w-4 h-4 mr-1" />
          {contact.connections?.length || 0}
        </Button>
        {canEdit && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit?.(contact)} 
            aria-label="Edit contact"
          >
            Edit
          </Button>
        )}
        {canDelete && (
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => onDelete?.(contact)} 
            aria-label="Delete contact"
          >
            Delete
          </Button>
        )}
      </div>
    </Card>
  )
}

// Example usage for testing/demo
const sampleContact: Contact = {
  id: '1',
  name: 'Jane Doe',
  tier: 'tier1',
  email: 'jane@example.com',
  phone: '+1 555-1234',
  relationshipToGary: 'Business Partner',
  hasKids: true,
  isMarried: true,
  location: 'New York, NY',
  interests: ['Marketing', 'Startups', 'Wine'],
  notes: 'Jane is a long-time collaborator and trusted advisor. She has deep expertise in marketing and has helped Gary with several ventures.',
  socialHandles: {
    instagram: 'janedoe',
    linkedin: 'jane-doe',
  },
  connections: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  addedBy: 'gary',
}

export function ContactCardDemo() {
  return (
    <div className="max-w-md mx-auto p-4">
      <ContactCard contact={sampleContact} />
    </div>
  )
} 