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
import { useEffect, useState } from 'react';

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
  const [liveConnections, setLiveConnections] = useState<any[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [connectionsError, setConnectionsError] = useState<string | null>(null);

  // Fetch live connections from backend
  useEffect(() => {
    if (!contact?.id) return;
    setLoadingConnections(true);
    setConnectionsError(null);
    fetch(`/api/contacts/${contact.id}/connections`)
      .then(res => res.json())
      .then(data => {
        setLiveConnections(data.connections || []);
        setLoadingConnections(false);
      })
      .catch(() => {
        setConnectionsError('Failed to load connections');
        setLoadingConnections(false);
      });
  }, [contact?.id, open]);

  // Refresh connections after add/remove
  const refreshConnections = () => {
    if (!contact?.id) return;
    setLoadingConnections(true);
    setConnectionsError(null);
    fetch(`/api/contacts/${contact.id}/connections`)
      .then(res => res.json())
      .then(data => {
        setLiveConnections(data.connections || []);
        setLoadingConnections(false);
      })
      .catch(() => {
        setConnectionsError('Failed to load connections');
        setLoadingConnections(false);
      });
  };

  const availableContacts = allContacts.filter(c => 
    c.id !== contact?.id && 
    !liveConnections.some(conn => conn.TARGET_CONTACT_ID === c.id)
  )

  const handleAddConnection = async () => {
    if (!contact || !selectedContactId) return
    const newConnection: Connection = {
      contactId: selectedContactId,
      strength: connectionStrength,
      type: connectionType,
      notes: connectionNotes || undefined,
      createdAt: new Date()
    }
    await onAddConnection(contact.id, newConnection)
    setSelectedContactId('')
    setConnectionStrength('medium')
    setConnectionType('business')
    setConnectionNotes('')
    refreshConnections();
  }

  const handleRemoveConnection = async (targetContactId: string) => {
    if (!contact) return
    await onRemoveConnection(contact.id, targetContactId)
    refreshConnections();
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
            <h3 className="text-lg font-medium">Current Connections ({liveConnections.length})</h3>
            {loadingConnections ? (
              <div className="text-center py-8 text-gray-500">Loading connections...</div>
            ) : connectionsError ? (
              <div className="text-center py-8 text-red-500">{connectionsError}</div>
            ) : liveConnections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4" />
                <p>No connections yet</p>
                <p className="text-sm">Add connections to build your network</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveConnections.map((connection) => {
                  const connectedContact = allContacts.find(c => c.id === connection.TARGET_CONTACT_ID)
                  if (!connectedContact) return null
                  return (
                    <Card key={connection.ID} className="relative">
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
                              {/* Show type and strength */}
                              <span className="text-sm text-gray-600 capitalize">
                                {connection.TYPE}
                              </span>
                              <div className={`w-2 h-2 rounded-full ${connection.STRENGTH === 'strong' ? 'bg-red-500' : connection.STRENGTH === 'medium' ? 'bg-orange-500' : 'bg-gray-500'}`} />
                              <span className="text-sm text-gray-600 capitalize">
                                {connection.STRENGTH}
                              </span>
                            </div>
                            {connection.NOTES && (
                              <p className="text-sm text-gray-500">{connection.NOTES}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveConnection(connection.TARGET_CONTACT_ID)}
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