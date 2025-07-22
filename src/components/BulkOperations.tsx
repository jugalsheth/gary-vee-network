'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Trash2, 
  Users, 
  Download, 
  AlertTriangle,
  CheckSquare,
  Square
} from 'lucide-react'
import type { Contact, Tier } from '@/lib/types'
import { exportContactsToCSV } from '@/lib/importExport'

interface BulkOperationsProps {
  contacts: Contact[]
  selectedContacts: Contact[]
  onSelectionChange: (contacts: Contact[]) => void
  onDeleteContacts: (contactIds: string[]) => void
  onUpdateContacts: (contactIds: string[], updates: Partial<Contact>) => void
}

export function BulkOperations({ 
  contacts, 
  selectedContacts, 
  onSelectionChange, 
  onDeleteContacts, 
  onUpdateContacts 
}: BulkOperationsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [showTierDialog, setShowTierDialog] = React.useState(false)
  const [newTier, setNewTier] = React.useState<Tier>('tier3')
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/contacts/analytics')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load analytics');
        setLoading(false);
      });
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(contacts)
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectContact = (contact: Contact, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedContacts, contact])
    } else {
      onSelectionChange(selectedContacts.filter(c => c.id !== contact.id))
    }
  }

  const handleBulkDelete = () => {
    const contactIds = selectedContacts.map(c => c.id)
    onDeleteContacts(contactIds)
    onSelectionChange([])
    setShowDeleteDialog(false)
  }

  const handleBulkTierChange = () => {
    const contactIds = selectedContacts.map(c => c.id)
    onUpdateContacts(contactIds, { tier: newTier })
    onSelectionChange([])
    setShowTierDialog(false)
  }

  const handleBulkExport = () => {
    try {
      exportContactsToCSV(selectedContacts)
    } catch (error) {
      console.error('Bulk export error:', error)
      alert(`Error exporting contacts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const isAllSelected = contacts.length > 0 && selectedContacts.length === contacts.length
  const isIndeterminate = selectedContacts.length > 0 && selectedContacts.length < contacts.length

  if (contacts.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Analytics summary */}
      <div className="mb-4">
        {loading ? (
          <div>Loading analytics...</div>
        ) : error || !analytics ? (
          <div>{error || 'No analytics data'}</div>
        ) : (
          <div className="flex gap-4">
            <div>Total Contacts: {analytics.totalContacts}</div>
            <div>Tier 1: {analytics.tier1}</div>
            <div>Tier 2: {analytics.tier2}</div>
            <div>Tier 3: {analytics.tier3}</div>
          </div>
        )}
      </div>
      {/* Selection Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              {selectedContacts.length} of {contacts.length} selected
            </span>
          </div>
          
          {selectedContacts.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {selectedContacts.length} selected
              </Badge>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedContacts.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTierDialog(true)}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Change Tier
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkExport}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Selected
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Contact Selection Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map(contact => (
          <div key={contact.id} className="flex items-start gap-3 p-3 border rounded-lg">
            <Checkbox
              checked={selectedContacts.some(c => c.id === contact.id)}
              onCheckedChange={(checked) => handleSelectContact(contact, checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium truncate">{contact.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {contact.tier}
                </Badge>
              </div>
              {contact.email && (
                <p className="text-sm text-gray-500 truncate">{contact.email}</p>
              )}
              <p className="text-sm text-gray-600 truncate">{contact.relationshipToGary}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirm Bulk Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                The following contacts will be permanently deleted:
              </AlertDescription>
            </Alert>
            
            <div className="max-h-40 overflow-y-auto space-y-2">
              {selectedContacts.map(contact => (
                <div key={contact.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="font-medium">{contact.name}</span>
                  <Badge variant="outline" className="text-xs">{contact.tier}</Badge>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleBulkDelete}>
                Delete {selectedContacts.length} Contact{selectedContacts.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tier Change Dialog */}
      <Dialog open={showTierDialog} onOpenChange={setShowTierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Change Tier for {selectedContacts.length} Contact{selectedContacts.length !== 1 ? 's' : ''}
            </DialogTitle>
            <DialogDescription>
              Select a new tier for the selected contacts.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Tier</label>
              <Select value={newTier} onValueChange={(value: Tier) => setNewTier(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tier1">Tier 1 (Closest to Gary)</SelectItem>
                  <SelectItem value="tier2">Tier 2 (Important contacts)</SelectItem>
                  <SelectItem value="tier3">Tier 3 (General network)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="max-h-40 overflow-y-auto space-y-2">
              {selectedContacts.map(contact => (
                <div key={contact.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="font-medium">{contact.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{contact.tier}</Badge>
                    <span className="text-xs text-gray-500">→</span>
                    <Badge variant="outline" className="text-xs">{newTier}</Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTierDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkTierChange}>
                Update {selectedContacts.length} Contact{selectedContacts.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 