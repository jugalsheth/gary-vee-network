'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, 
  Heart, 
  Building, 
  Home, 
  Tag,
  Plus,
  X
} from 'lucide-react'
import type { Contact, Connection, ConnectionStrength, ConnectionType } from '@/lib/types'

interface ConnectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact | null
  allContacts: Contact[]
  onAddConnection: (contactId: string, connection: Connection) => void
  onRemoveConnection: (contactId: string, targetContactId: string) => void
}

export function ConnectionModal({
  open,
  onOpenChange,
  contact,
  allContacts,
  onAddConnection,
  onRemoveConnection
}: ConnectionModalProps) {
  const [selectedContactId, setSelectedContactId] = React.useState<string>('')
  const [connectionStrength, setConnectionStrength] = React.useState<ConnectionStrength>('medium')
  const [connectionType, setConnectionType] = React.useState<ConnectionType>('business')
  const [connectionNotes, setConnectionNotes] = React.useState<string>('')

  const availableContacts = allContacts.filter(c => 
    c.id !== contact?.id && 
    !(contact?.connections || []).some(conn => conn.contactId === c.id)
  )

  const handleAddConnection = () => {
    if (!contact || !selectedContactId) return

    const newConnection: Connection = {
      contactId: selectedContactId,
      strength: connectionStrength,
      type: connectionType,
      notes: connectionNotes || undefined,
      createdAt: new Date()
    }

    onAddConnection(contact.id, newConnection)
    
    // Reset form
    setSelectedContactId('')
    setConnectionStrength('medium')
    setConnectionType('business')
    setConnectionNotes('')
  }

  const handleRemoveConnection = (targetContactId: string) => {
    if (!contact) return
    onRemoveConnection(contact.id, targetContactId)
  }

  const getConnectionTypeIcon = (type: ConnectionType) => {
    switch (type) {
      case 'business': return <Building className="w-4 h-4" />
      case 'personal': return <Heart className="w-4 h-4" />
      case 'family': return <Home className="w-4 h-4" />
      case 'mutual-interest': return <Tag className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const getConnectionTypeLabel = (type: ConnectionType) => {
    switch (type) {
      case 'business': return 'Business'
      case 'personal': return 'Personal'
      case 'family': return 'Family'
      case 'mutual-interest': return 'Mutual Interest'
      default: return type
    }
  }

  const getStrengthColor = (strength: ConnectionStrength) => {
    switch (strength) {
      case 'strong': return 'bg-red-500'
      case 'medium': return 'bg-orange-500'
      case 'weak': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  if (!contact) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Connections for {contact.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Connections */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Current Connections ({(contact.connections || []).length})</h3>
            
            {(contact.connections || []).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4" />
                <p>No connections yet</p>
                <p className="text-sm">Add connections to build your network</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(contact.connections || []).map((connection) => {
                  const connectedContact = allContacts.find(c => c.id === connection.contactId)
                  if (!connectedContact) return null

                  return (
                    <Card key={connection.contactId} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{connectedContact.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {connectedContact.tier}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              {getConnectionTypeIcon(connection.type)}
                              <span className="text-sm text-gray-600">
                                {getConnectionTypeLabel(connection.type)}
                              </span>
                              <div className={`w-2 h-2 rounded-full ${getStrengthColor(connection.strength)}`} />
                              <span className="text-sm text-gray-600 capitalize">
                                {connection.strength}
                              </span>
                            </div>
                            
                            {connection.notes && (
                              <p className="text-sm text-gray-500">{connection.notes}</p>
                            )}
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveConnection(connection.contactId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Add New Connection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Add New Connection</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Contact</Label>
                <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a contact to connect" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableContacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} ({contact.tier})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Connection Type</Label>
                <Select value={connectionType} onValueChange={(value: ConnectionType) => setConnectionType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Business
                      </div>
                    </SelectItem>
                    <SelectItem value="personal">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Personal
                      </div>
                    </SelectItem>
                    <SelectItem value="family">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Family
                      </div>
                    </SelectItem>
                    <SelectItem value="mutual-interest">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Mutual Interest
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Relationship Strength</Label>
                <Select value={connectionStrength} onValueChange={(value: ConnectionStrength) => setConnectionStrength(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strong">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        Strong
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="weak">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500" />
                        Weak
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={connectionNotes}
                  onChange={(e) => setConnectionNotes(e.target.value)}
                  placeholder="Add notes about this connection..."
                  rows={3}
                />
              </div>
            </div>

            <Button 
              onClick={handleAddConnection}
              disabled={!selectedContactId}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Connection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 