'use client'

import { Edit2, Trash2, Phone, MapPin, Instagram, MessageCircle, UserPlus, Star, Clock, TrendingUp, Heart, Building, Home, Users, Zap } from "lucide-react"
import type { Contact, Connection } from "@/lib/types"
import * as React from "react"
import { memo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DeleteConfirmationModal } from './DeleteConfirmationModal'
import { ConnectionModal } from './ConnectionModal'
import { MessageModal } from './MessageModal'

export interface ContactCardProps {
  contact: Contact
  allContacts?: Contact[]
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
  onManageConnections?: (contact: Contact) => void
  onNavigate?: (contact: Contact) => void
  onViewContact?: (contact: Contact) => void
  isHighlighted?: boolean;
  id?: string;
}

const ContactCardComponent = ({ contact, allContacts, onEdit, onDelete, onManageConnections, onNavigate, onViewContact, isHighlighted, id }: ContactCardProps) => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingConnection, setIsAddingConnection] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  if (!contact || !contact.name || !contact.id) return null;

  // Calculate connection strength based on connections
  const connectionStrength = contact.connections?.length || 0;
  const getConnectionStrengthColor = () => {
    if (connectionStrength >= 5) return 'from-purple-500 to-purple-600';
    if (connectionStrength >= 3) return 'from-blue-500 to-blue-600';
    if (connectionStrength >= 1) return 'from-green-500 to-green-600';
    return 'from-gray-400 to-gray-500';
  };

  // Get contact status (simulated)
  const getContactStatus = () => {
    const lastActivity = contact.updatedAt ? new Date(contact.updatedAt) : new Date();
    const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActivity <= 1) return { status: 'active', color: 'bg-green-500', label: 'Active' };
    if (daysSinceActivity <= 7) return { status: 'recent', color: 'bg-yellow-500', label: 'Recent' };
    if (daysSinceActivity <= 30) return { status: 'moderate', color: 'bg-orange-500', label: 'Moderate' };
    return { status: 'inactive', color: 'bg-gray-400', label: 'Inactive' };
  };

  // Get contact type icon
  const getContactTypeIcon = () => {
    switch (contact.contactType) {
      case 'business': return <Building className="w-3 h-3" />;
      case 'influencer': return <Star className="w-3 h-3" />;
      case 'general': return <Users className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  const contactStatus = getContactStatus();

  // Handler functions
  const handleDelete = async (contactToDelete: Contact) => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(contactToDelete);
      }
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddConnection = async (connectionData: Omit<Connection, 'contactId'>) => {
    setIsAddingConnection(true);
    try {
      // For now, we'll just simulate adding a connection
      // In the future, this will call an API to actually create the connection
      console.log('Adding connection:', connectionData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowConnectionModal(false);
      // You can add a toast notification here
    } catch (error) {
      console.error('Error adding connection:', error);
    } finally {
      setIsAddingConnection(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    setIsSendingMessage(true);
    try {
      // For now, we'll just simulate sending a message
      // In the future, this will call an API to actually send the message
      console.log('Sending message to', contact.name, ':', message);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowMessageModal(false);
      // You can add a toast notification here
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <TooltipProvider>
      <div
        id={id}
        className={`group relative transition-all duration-300 ease-out bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 cursor-pointer ${
          isHighlighted ? 'transform scale-102 ring-2 ring-blue-500/20 shadow-lg' : ''
        }`}
        data-contact-id={contact.id}
        onMouseEnter={() => setShowQuickActions(true)}
        onMouseLeave={() => setShowQuickActions(false)}
        // Removed onClick handler to make card static
      >
        {/* Enhanced tier indicator with shimmer */}
        <div className={`relative h-1.5 w-full bg-gradient-to-r transition-all duration-300 ease-out group-hover:h-2 rounded-t-xl ${
          contact.tier === 'tier1' ? 'from-pink-400 via-pink-500 to-pink-600 group-hover:shadow-sm group-hover:shadow-pink-500/20' :
          contact.tier === 'tier2' ? 'from-yellow-400 via-yellow-500 to-yellow-600 group-hover:shadow-sm group-hover:shadow-yellow-500/20' :
          'from-green-400 via-green-500 to-green-600 group-hover:shadow-sm group-hover:shadow-green-500/20'
        }`}>
          {/* Enhanced shimmer effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
        
        {/* Enhanced background glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
        
        <div className="relative p-6">
          {/* Enhanced Header section */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {/* Enhanced Avatar with status indicator */}
              <div className="relative">
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-lg ${
                  contact.tier === 'tier1' ? 'bg-gradient-to-br from-pink-500 to-pink-600 group-hover:shadow-pink-500/25' :
                  contact.tier === 'tier2' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 group-hover:shadow-yellow-500/25' :
                  'bg-gradient-to-br from-green-500 to-green-600 group-hover:shadow-green-500/25'
                }`}>
                  {contact.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'}
                  {/* Enhanced pulse ring */}
                  <div className={`absolute -inset-0.5 rounded-full opacity-0 group-hover:opacity-40 group-hover:animate-pulse ${
                    contact.tier === 'tier1' ? 'bg-pink-400' :
                    contact.tier === 'tier2' ? 'bg-yellow-400' :
                    'bg-green-400'
                  }`} />
                </div>
                {/* Status indicator */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${contactStatus.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-gray-900 dark:text-white text-lg leading-tight truncate transition-all duration-300 ease-out group-hover:text-opacity-90 ${
                  contact.tier === 'tier1' ? 'group-hover:text-pink-600' :
                  contact.tier === 'tier2' ? 'group-hover:text-yellow-600' :
                  'group-hover:text-green-600'
                }`}>
                  {contact.name || 'Unknown'}
                </h3>
                {contact.email && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5 transition-colors duration-300 group-hover:text-gray-600">
                    {contact.email}
                  </p>
                )}
                {/* Contact type badge */}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {getContactTypeIcon()}
                    <span className="ml-1 capitalize">{contact.contactType || 'contact'}</span>
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    <Clock className="w-3 h-3 mr-1" />
                    {contactStatus.label}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Enhanced Tier badge with connection info */}
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-md ${
                contact.tier === 'tier1' ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white group-hover:shadow-pink-500/20' :
                contact.tier === 'tier2' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white group-hover:shadow-yellow-500/20' :
                'bg-gradient-to-r from-green-500 to-green-600 text-white group-hover:shadow-green-500/20'
              }`}>
                TIER {contact.tier.slice(-1)}
              </span>
              
              {/* Connection strength indicator */}
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">{connectionStrength}</span>
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getConnectionStrengthColor()}`} />
              </div>
            </div>
          </div>
          
          {/* Enhanced Contact details with icons */}
          <div className="space-y-2 mb-4">
            {contact.phone && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200 group-hover:text-gray-700">
                <Phone className="w-4 h-4 mr-3 flex-shrink-0 opacity-70" />
                <span className="truncate">{contact.phone}</span>
              </div>
            )}
            {(contact.location || contact.city) && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200 group-hover:text-gray-700">
                <MapPin className="w-4 h-4 mr-3 flex-shrink-0 opacity-70" />
                <span className="truncate">{contact.location || contact.city}</span>
              </div>
            )}
            {contact.instagram && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200 group-hover:text-gray-700">
                <Instagram className="w-4 h-4 mr-3 flex-shrink-0 opacity-70" />
                <span className="truncate">@{contact.instagram}</span>
              </div>
            )}
          </div>
          
          {/* Enhanced Notes section with expand/collapse */}
          {contact.notes && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed transition-colors duration-200 group-hover:text-gray-700">
                {contact.notes}
              </p>
              {contact.notes.length > 100 && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Toggle notes expansion
                    const notesElement = e.currentTarget.previousElementSibling;
                    if (notesElement) {
                      notesElement.classList.toggle('line-clamp-2');
                      e.currentTarget.textContent = notesElement.classList.contains('line-clamp-2') ? 'Read more...' : 'Show less';
                    }
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600 mt-1 font-medium transition-colors"
                >
                  Read more...
                </button>
              )}
            </div>
          )}
          
          {/* Enhanced Action buttons with tooltips */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex space-x-2">
              {/* Edit Button with Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onEdit && onEdit(contact)}
                    className={`p-2.5 rounded-lg transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 border border-transparent hover:border-current ${
                      contact.tier === 'tier1' ? 'hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-900/10' :
                      contact.tier === 'tier2' ? 'hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-900/10' :
                      'hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/10'
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit contact</p>
                </TooltipContent>
              </Tooltip>

              {/* Delete Button with Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2.5 rounded-lg transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 border border-transparent hover:border-current"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete contact</p>
                </TooltipContent>
              </Tooltip>

              {/* Quick Actions */}
              {showQuickActions && (
                <>
                  {/* Message Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => setShowMessageModal(true)}
                        className="p-2.5 rounded-lg transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/10 border border-transparent hover:border-current"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send message</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Add Connection Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => setShowConnectionModal(true)}
                        className="p-2.5 rounded-lg transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/10 border border-transparent hover:border-current"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add connection</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
            
            {/* Enhanced Date display with activity indicator */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-400 transition-all duration-200 group-hover:text-gray-500 font-medium">
                {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
              {/* Activity indicator */}
              <div className={`w-2 h-2 rounded-full ${contactStatus.color} opacity-60`} />
            </div>
            
            {/* View Contact Button */}
            {onViewContact && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewContact(contact);
                }}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                View Contact →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeleteConfirmationModal
        contact={contact}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      <ConnectionModal
        sourceContact={contact}
        allContacts={allContacts || []}
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
        onConfirm={handleAddConnection}
        isLoading={isAddingConnection}
      />

      <MessageModal
        contact={contact}
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        onSend={handleSendMessage}
        isLoading={isSendingMessage}
      />
    </TooltipProvider>
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
  notes: 'Jane is a long-time collaborator and trusted advisor. She has deep expertise in marketing and has helped Gary with several ventures. She has been instrumental in scaling multiple businesses and has a keen eye for market trends.',
  instagram: 'janedoe',
  connections: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  contactType: 'business', // valid value
  createdBy: 'gary', // placeholder value
}

export function ContactCardDemo({ contact, allContacts }: { contact: Contact; allContacts?: Contact[] }) {
  return (
    <div className="max-w-md mx-auto p-4">
      <MemoizedContactCard contact={contact} allContacts={allContacts} />
    </div>
  )
} 