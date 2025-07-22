'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ContactAvatar } from "./ContactAvatar"
import { Mail, Phone, Instagram, Edit2, Trash2, Loader2, Users, MapPin } from "lucide-react"
import * as React from "react"
import type { Contact } from "@/lib/types"

export interface ContactCardProps {
  contact: Contact
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
  onManageConnections?: (contact: Contact) => void
}

export function ContactCard({ contact, onEdit, onDelete, onManageConnections }: ContactCardProps) {
  // Defensive check: skip rendering if essential data is missing
  if (!contact || !contact.name || !contact.id) return null;
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showActions, setShowActions] = React.useState(false);

  const handleEdit = () => {
    if (onEdit) onEdit(contact);
  };
  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(contact);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  // Quick action handlers
  const handleCall = () => contact.phone && window.open(`tel:${contact.phone}`);
  const handleEmail = () => contact.email && window.open(`mailto:${contact.email}`);
  const handleInstagram = () => contact.instagram && window.open(`https://instagram.com/${contact.instagram}`);

  return (
    <div
      className="premium-card card-entrance group relative overflow-hidden transition-modern"
      tabIndex={0}
      aria-label={`Contact card for ${contact.name}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      data-contact-id={contact.id}
    >
      {/* Glassmorphism overlay for extra depth */}
      <div className="absolute inset-0 pointer-events-none glass-premium z-0" aria-hidden="true" />
      {/* Tier Badge (top right, never overlaps name) */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant={`tier${contact.tier.slice(-1)}` as any} className="shadow-premium px-3 py-1 text-xs font-semibold animate-fade-in">
          {contact.tier.replace('tier', 'Tier ')}
        </Badge>
      </div>
      {/* Quick Actions (hover) */}
      <div className={`absolute left-4 top-4 z-10 flex flex-col gap-2 transition-all duration-300 ${showActions ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}
        aria-label="Quick actions"
      >
        {contact.phone && (
          <Button variant="ghost" size="icon" onClick={handleCall} aria-label="Call" title="Call" className="hover:bg-pink-100 dark:hover:bg-pink-900/30 shadow-premium">
            <Phone className="w-4 h-4" />
          </Button>
        )}
        {contact.email && (
          <Button variant="ghost" size="icon" onClick={handleEmail} aria-label="Email" title="Email" className="hover:bg-blue-100 dark:hover:bg-blue-900/30 shadow-premium">
            <Mail className="w-4 h-4" />
          </Button>
        )}
        {contact.instagram && (
          <Button variant="ghost" size="icon" onClick={handleInstagram} aria-label="Instagram" title="Instagram" className="hover:bg-gradient-to-br from-pink-200 to-yellow-100 dark:from-pink-900/30 dark:to-yellow-900/30 shadow-premium">
            <Instagram className="w-4 h-4" />
          </Button>
        )}
      </div>
      {/* Main Content */}
      <div className="relative z-10 flex flex-col gap-4">
        {/* Avatar, Name, and Relationship */}
        <div className="flex items-center gap-4 mb-2">
          <ContactAvatar name={contact.name} tier={contact.tier} size="lg" className="pulse-glow" />
          <div className="flex-1 min-w-0">
            <h3 className="font-premium-title gradient-text truncate max-w-[160px]" title={contact.name}>
              {contact.name}
            </h3>
            {contact.relationshipToGary && (
              <p className="font-premium-meta truncate max-w-[160px]" title={contact.relationshipToGary}>
                {contact.relationshipToGary}
              </p>
            )}
          </div>
        </div>
        {/* Contact Details */}
        <div className="flex flex-col gap-2 mb-2">
          {contact.email && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Mail className="h-4 w-4 mr-2 flex-shrink-0 opacity-70" />
              <span className="truncate max-w-[140px]" title={contact.email}>{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Phone className="h-4 w-4 mr-2 flex-shrink-0 opacity-70" />
              <span className="truncate max-w-[140px]" title={contact.phone}>{contact.phone}</span>
            </div>
          )}
          {contact.location && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0 opacity-70" />
              <span className="truncate max-w-[140px]" title={contact.location}>{contact.location}</span>
            </div>
          )}
          {contact.instagram && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Instagram className="h-4 w-4 mr-2 flex-shrink-0 opacity-70" />
              <a
                href={`https://instagram.com/${contact.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate max-w-[120px] hover:underline"
                title={`@${contact.instagram}`}
                aria-label={`Instagram profile of ${contact.name}`}
              >
                @{contact.instagram}
              </a>
            </div>
          )}
        </div>
        {/* Notes Preview */}
        {contact.notes && (
          <div className="mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 font-premium-meta truncate max-w-[220px]" title={contact.notes}>
              {contact.notes}
            </p>
          </div>
        )}
        {/* Action Buttons & Connections */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center gap-1 transition-modern hover:scale-105"
              aria-label="Edit contact"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-modern hover:scale-105"
              aria-label="Delete contact"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Users className="h-4 w-4 mr-1" />
            <span>{contact.connections?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
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
      <ContactCard contact={sampleContact} />
    </div>
  )
} 