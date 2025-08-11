'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserPlus, Users, Building, Heart, Home, Zap } from 'lucide-react'
import type { Contact, Connection, ConnectionStrength, ConnectionType } from '@/lib/types'
import { ContactPicker } from './ContactPicker'

interface ConnectionModalProps {
  sourceContact: Contact | null
  allContacts: Contact[]
  isOpen: boolean
  onClose: () => void
  onConfirm: (connection: Omit<Connection, 'contactId'> & { targetContactId: string }) => void
  isLoading?: boolean
}

const connectionStrengths: { value: ConnectionStrength; label: string; description: string }[] = [
  { value: 'weak', label: 'Weak', description: 'Occasional contact or acquaintance' },
  { value: 'medium', label: 'Medium', description: 'Regular contact or colleague' },
  { value: 'strong', label: 'Strong', description: 'Close friend or business partner' }
]

const connectionTypes: { value: ConnectionType; label: string; icon: React.ReactNode }[] = [
  { value: 'business', label: 'Business', icon: <Building className="w-4 h-4" /> },
  { value: 'personal', label: 'Personal', icon: <Heart className="w-4 h-4" /> },
  { value: 'family', label: 'Family', icon: <Home className="w-4 h-4" /> },
  { value: 'mutual-interest', label: 'Mutual Interest', icon: <Zap className="w-4 h-4" /> }
]

export function ConnectionModal({
  sourceContact,
  allContacts,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}: ConnectionModalProps) {
  const [strength, setStrength] = useState<ConnectionStrength>('medium')
  const [type, setType] = useState<ConnectionType>('business')
  const [notes, setNotes] = useState('')
  const [selectedContactId, setSelectedContactId] = useState('')

  if (!sourceContact) return null

  const handleConfirm = () => {
    if (!selectedContactId) return
    
    onConfirm({
      strength,
      type,
      notes: notes.trim() || undefined,
      createdAt: new Date(),
      targetContactId: selectedContactId
    })
  }

  const handleClose = () => {
    setStrength('medium')
    setType('business')
    setNotes('')
    setSelectedContactId('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Add Connection</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Connect {sourceContact.name} with {targetContact.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Contact Display */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {sourceContact.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <span className="font-medium text-sm">{sourceContact.name}</span>
            </div>
            <Users className="w-4 h-4 text-gray-400" />
            <div className="text-sm text-gray-500">Select contact to connect with</div>
          </div>

          {/* Contact Picker */}
          <ContactPicker
            contacts={allContacts}
            selectedContactId={selectedContactId}
            onContactSelect={setSelectedContactId}
            excludeContactId={sourceContact.id}
          />

          {/* Connection Strength */}
          <div className="space-y-2">
            <Label htmlFor="strength">Connection Strength</Label>
            <Select value={strength} onValueChange={(value: ConnectionStrength) => setStrength(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select strength" />
              </SelectTrigger>
              <SelectContent>
                {connectionStrengths.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-gray-500">({option.description})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Connection Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Connection Type</Label>
            <Select value={type} onValueChange={(value: ConnectionType) => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {connectionTypes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional context about this connection..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Connection
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 