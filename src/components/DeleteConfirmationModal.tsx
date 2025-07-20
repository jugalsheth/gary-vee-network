'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { getTierBadge } from '@/lib/constants'
import type { Contact } from '@/lib/types'
import { AlertTriangle, Trash2, User } from 'lucide-react'

export interface DeleteConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact | null
  onConfirm: (contactId: string) => void
}

export function DeleteConfirmationModal({ open, onOpenChange, contact, onConfirm }: DeleteConfirmationModalProps) {
  const handleConfirm = () => {
    if (contact) {
      onConfirm(contact.id)
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!contact) return null

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Confirm Delete Contact
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this contact? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              The following contact will be permanently deleted:
            </AlertDescription>
          </Alert>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">{contact.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getTierBadge(contact.tier)}>
                    {contact.tier === 'tier1' ? 'Tier 1' : contact.tier === 'tier2' ? 'Tier 2' : 'Tier 3'}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{contact.relationshipToGary}</span>
                </div>
                {contact.email && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">{contact.email}</p>
                )}
                {contact.location && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{contact.location}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 transition-colors duration-300">
            <p>• All contact information will be permanently removed</p>
            <p>• Any connections to other contacts will be lost</p>
            <p>• This action cannot be undone</p>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm} className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Contact
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 