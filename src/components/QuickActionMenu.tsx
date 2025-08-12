'use client';

import React from 'react';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Edit, 
  Trash2, 
  Star,
  UserPlus,
  Calendar,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Contact } from '@/lib/types';

interface QuickActionMenuProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onMessage: (contact: Contact) => void;
  onCall: (contact: Contact) => void;
  onEmail: (contact: Contact) => void;
  onNavigate: (contact: Contact) => void;
  isVisible: boolean;
}

export function QuickActionMenu({
  contact,
  onEdit,
  onDelete,
  onMessage,
  onCall,
  onEmail,
  onNavigate,
  isVisible
}: QuickActionMenuProps) {
  if (!isVisible) return null;

  const actions = [
    {
      icon: <MessageCircle className="w-4 h-4" />,
      label: 'Message',
      action: () => onMessage(contact),
      color: 'bg-blue-500 hover:bg-blue-600',
      shortcut: 'M'
    },
    {
      icon: <Phone className="w-4 h-4" />,
      label: 'Call',
      action: () => onCall(contact),
      color: 'bg-green-500 hover:bg-green-600',
      shortcut: 'C',
      disabled: !contact.phone
    },
    {
      icon: <Mail className="w-4 h-4" />,
      label: 'Email',
      action: () => onEmail(contact),
      color: 'bg-purple-500 hover:bg-purple-600',
      shortcut: 'E',
      disabled: !contact.email
    },
    {
      icon: <MapPin className="w-4 h-4" />,
      label: 'Location',
      action: () => {
        if (contact.location) {
          window.open(`https://maps.google.com/?q=${encodeURIComponent(contact.location)}`, '_blank');
        }
      },
      color: 'bg-orange-500 hover:bg-orange-600',
      shortcut: 'L',
      disabled: !contact.location
    },
    {
      icon: <Instagram className="w-4 h-4" />,
      label: 'Instagram',
      action: () => {
        if (contact.instagram) {
          window.open(`https://instagram.com/${contact.instagram}`, '_blank');
        }
      },
      color: 'bg-pink-500 hover:bg-pink-600',
      shortcut: 'I',
      disabled: !contact.instagram
    },
    {
      icon: <Edit className="w-4 h-4" />,
      label: 'Edit',
      action: () => onEdit(contact),
      color: 'bg-gray-500 hover:bg-gray-600',
      shortcut: 'E'
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'tier1': return 'bg-gradient-to-r from-pink-500 to-pink-600';
      case 'tier2': return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      default: return 'bg-gradient-to-r from-green-500 to-green-600';
    }
  };

  return (
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 transition-all duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-sm w-full mx-4">
        {/* Contact Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getTierColor(contact.tier)}`}>
            {contact.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</p>
            <Badge variant="outline" className="text-xs mt-1">
              {contact.tier.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              disabled={action.disabled}
              className={`${action.color} text-white h-12 flex flex-col items-center justify-center gap-1 text-xs transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {action.icon}
              <span>{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Additional Info */}
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {contact.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{contact.location}</span>
            </div>
          )}
          {contact.relationshipToGary && (
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span>{contact.relationshipToGary}</span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-gray-500">Tier {contact.tier.slice(-1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">
              {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-3 text-xs text-gray-400 text-center">
          <Zap className="w-3 h-3 inline mr-1" />
          Use keyboard shortcuts for faster access
        </div>
      </div>
    </div>
  );
}
