'use client'

import { Edit2, Trash2, Phone, MapPin, Instagram } from "lucide-react"
import type { Contact } from "@/lib/types"
import * as React from "react"
import { memo } from "react"

export interface ContactCardProps {
  contact: Contact
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
  onManageConnections?: (contact: Contact) => void
  isHighlighted?: boolean;
  id?: string;
}

const ContactCardComponent = ({ contact, onEdit, onDelete, isHighlighted, id }: ContactCardProps) => {
  if (!contact || !contact.name || !contact.id) return null;
  return (
    <div
      id={id}
      className={`group relative transition-all duration-500 ${
        isHighlighted ? 'transform scale-105 ring-4 ring-blue-500/30 shadow-xl' : ''
      }`}
      data-contact-id={contact.id}
    >
      {/* Enhanced tier indicator with pulse animation and shimmer */}
      <div className={`relative h-1.5 w-full bg-gradient-to-r transition-all duration-500 group-hover:h-3 ${
        contact.tier === 'tier1' ? 'from-pink-400 via-pink-500 to-pink-600 group-hover:shadow-lg group-hover:shadow-pink-500/50' :
        contact.tier === 'tier2' ? 'from-yellow-400 via-yellow-500 to-yellow-600 group-hover:shadow-lg group-hover:shadow-yellow-500/50' :
        'from-green-400 via-green-500 to-green-600 group-hover:shadow-lg group-hover:shadow-green-500/50'
      }`}>
        {/* Animated shimmer effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
      {/* Subtle glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="relative p-6">
        {/* Enhanced header section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Avatar with enhanced glow, bounce, and animated pulse ring */}
            <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl ${
              contact.tier === 'tier1' ? 'bg-gradient-to-br from-pink-500 to-pink-600 group-hover:shadow-pink-500/40' :
              contact.tier === 'tier2' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 group-hover:shadow-yellow-500/40' :
              'bg-gradient-to-br from-green-500 to-green-600 group-hover:shadow-green-500/40'
            }`}>
              {contact.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'}
              {/* Animated pulse ring */}
              <div className={`absolute -inset-1 rounded-full opacity-0 group-hover:opacity-75 group-hover:animate-ping ${
                contact.tier === 'tier1' ? 'bg-pink-400' :
                contact.tier === 'tier2' ? 'bg-yellow-400' :
                'bg-green-400'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-gray-900 dark:text-white text-lg leading-tight truncate transition-all duration-300 group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:text-transparent ${
                contact.tier === 'tier1' ? 'group-hover:from-pink-500 group-hover:to-pink-600' :
                contact.tier === 'tier2' ? 'group-hover:from-yellow-500 group-hover:to-yellow-600' :
                'group-hover:from-green-500 group-hover:to-green-600'
              }`}>
                {contact.name || 'Unknown'}
              </h3>
              {contact.email && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {contact.email}
                </p>
              )}
            </div>
          </div>
          {/* Enhanced tier badge with bounce animation */}
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition-all duration-500 group-hover:scale-110 group-hover:animate-bounce group-hover:shadow-xl ${
            contact.tier === 'tier1' ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white group-hover:shadow-pink-500/30' :
            contact.tier === 'tier2' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white group-hover:shadow-yellow-500/30' :
            'bg-gradient-to-r from-green-500 to-green-600 text-white group-hover:shadow-green-500/30'
          }`}>
            TIER {contact.tier.slice(-1)}
          </span>
        </div>
        {/* Enhanced contact details with icons */}
        <div className="space-y-2 mb-4">
          {contact.phone && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors group-hover:text-gray-700">
              <Phone className="w-4 h-4 mr-3 flex-shrink-0 opacity-70" />
              <span className="truncate">{contact.phone}</span>
            </div>
          )}
          {(contact.location || contact.city) && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors group-hover:text-gray-700">
              <MapPin className="w-4 h-4 mr-3 flex-shrink-0 opacity-70" />
              <span className="truncate">{contact.location || contact.city}</span>
            </div>
          )}
          {contact.instagram && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors group-hover:text-gray-700">
              <Instagram className="w-4 h-4 mr-3 flex-shrink-0 opacity-70" />
              <span className="truncate">{contact.instagram}</span>
            </div>
          )}
        </div>
        {/* Enhanced notes section */}
        {contact.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {contact.notes}
            </p>
          </div>
        )}
        {/* Premium action buttons - KEEP EXISTING FUNCTIONALITY */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit && onEdit(contact)}
              className={`p-2.5 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 border border-transparent hover:border-current ${
                contact.tier === 'tier1' ? 'hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-900/20' :
                contact.tier === 'tier2' ? 'hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-900/20' :
                'hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20'
              }`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete && onDelete(contact)}
              className="p-2.5 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 border border-transparent hover:border-current"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          {/* Enhanced date display */}
          <div className="text-xs text-gray-400 transition-all duration-300 group-hover:text-gray-500 font-medium">
            {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Unknown'}
          </div>
        </div>
      </div>
    </div>
  );
}

const MemoizedContactCard = memo(ContactCardComponent, (prevProps, nextProps) => {
  // Only re-render if contact ID or update time changes
  const shouldUpdate = (
    prevProps.contact.id !== nextProps.contact.id ||
    prevProps.contact.updatedAt !== nextProps.contact.updatedAt
  );
  if (!shouldUpdate) {
    console.log('⚡ ContactCard render skipped for:', prevProps.contact.name);
  }
  return !shouldUpdate;
});

export default MemoizedContactCard;

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
  instagram: 'janedoe',
  connections: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  contactType: 'business', // valid value
  createdBy: 'gary', // placeholder value
}

export function ContactCardDemo() {
  return (
    <div className="max-w-md mx-auto p-4">
      <MemoizedContactCard contact={sampleContact} />
    </div>
  )
} 