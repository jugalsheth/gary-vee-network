'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'
import type { Contact } from '@/lib/types'

interface ContactPickerProps {
  contacts: Contact[]
  selectedContactId: string
  onContactSelect: (contactId: string) => void
  excludeContactId?: string
  placeholder?: string
}

export function ContactPicker({
  contacts,
  selectedContactId,
  onContactSelect,
  excludeContactId,
  placeholder = "Select a contact to connect with..."
}: ContactPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter out the current contact and apply search
  const availableContacts = contacts.filter(contact => 
    contact.id !== excludeContactId &&
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-2">
      <Label>Select Contact to Connect With</Label>
      <Select value={selectedContactId} onValueChange={onContactSelect}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {availableContacts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? 'No contacts found matching your search.' : 'No contacts available.'}
              </div>
            ) : (
              availableContacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {contact.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{contact.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {contact.email || contact.phone || 'No contact info'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {contact.tier}
                    </div>
                  </div>
                </SelectItem>
              ))
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  )
} 