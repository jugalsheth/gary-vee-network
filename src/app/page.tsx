'use client'

import { useState, useEffect, useCallback } from 'react'
import { ContactCard } from '@/components/ContactCard'
import { ContactGridSkeleton } from '@/components/ContactCardSkeleton'
import { AddContactModal } from '@/components/AddContactModal'
import { EditContactModal } from '@/components/EditContactModal'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'
import { AIChat } from '@/components/AIChat'
import { AdvancedSearch, type FilterState } from '@/components/AdvancedSearch'
import { ImportModal } from '@/components/ImportModal'
import { ExportButton } from '@/components/ExportButton'
import { ThemeToggle } from '@/components/ThemeToggle'
import { HeaderAnalytics, HeaderAnalyticsMobile } from '@/components/HeaderAnalytics'
import { BulkOperations } from '@/components/BulkOperations'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { NetworkVisualization } from '@/components/NetworkVisualization'
import { ConnectionModal } from '@/components/ConnectionModal'
import { NetworkInsights } from '@/components/NetworkInsights'
import { VoiceNotesDemo } from '@/components/VoiceNotesDemo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Upload, Users, Grid, List, Network, BarChart3, Mic } from 'lucide-react'
import { getTeamColor } from '@/lib/auth'
import { getContacts, addContact, updateContact, deleteContact, saveContacts } from '@/lib/storage'
import { showSuccessToast, showErrorToast, trackContactMilestone } from '@/lib/toast'
import type { Contact, Connection } from '@/lib/types'
import { initializeSampleData } from '@/lib/sampleData'

export default function Home() {
  const { user, logout } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [showVoiceNotesDemo, setShowVoiceNotesDemo] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'bulk' | 'network' | 'insights'>('grid')
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    searchText: '',
    tier: 'all',
    hasKids: null,
    isMarried: null,
    location: 'all',
    interests: []
  })

  // Load contacts from localStorage on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true)
        // Simulate realistic loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const storedContacts = getContacts()
        if (storedContacts.length === 0) {
          // Initialize with sample data if no contacts exist
          const sampleData = initializeSampleData()
          saveContacts(sampleData)
          setContacts(sampleData)
          setFilteredContacts(sampleData)
        } else {
          setContacts(storedContacts)
          setFilteredContacts(storedContacts)
        }
      } catch (error) {
        console.error('Error loading contacts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContacts()
  }, [])

  const handleAddContact = useCallback((contact: Contact) => {
    try {
      addContact(contact)
      setContacts(prev => [...prev, contact])
      setFilteredContacts(prev => [...prev, contact])
      setShowAddModal(false)
      
      // Track milestone
      trackContactMilestone(contacts.length + 1)
    } catch (error) {
      console.error('Error adding contact:', error)
      showErrorToast.contactAddFailed()
    }
  }, [contacts.length])

  const handleEditContact = useCallback((contact: Contact) => {
    setSelectedContact(contact)
    setShowEditModal(true)
  }, [])

  const handleUpdateContact = useCallback((updatedContact: Contact) => {
    try {
      updateContact(updatedContact)
      setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c))
      setFilteredContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c))
      
      // Show success toast
      showSuccessToast.contactUpdated(updatedContact.name)
    } catch (error) {
      console.error('Error updating contact:', error)
      showErrorToast.contactUpdateFailed()
    }
  }, [])

  const handleDeleteContact = useCallback((contact: Contact) => {
    setSelectedContact(contact)
    setShowDeleteModal(true)
  }, [])

  const handleConfirmDeleteContact = useCallback((contactId: string) => {
    try {
      const contactToDelete = contacts.find(c => c.id === contactId)
      deleteContact(contactId)
      setContacts(prev => prev.filter(c => c.id !== contactId))
      setFilteredContacts(prev => prev.filter(c => c.id !== contactId))
      setSelectedContacts(prev => prev.filter(c => c.id !== contactId))
      
      // Show success toast
      if (contactToDelete) {
        showSuccessToast.contactDeleted(contactToDelete.name)
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
      showErrorToast.contactDeleteFailed()
    }
  }, [contacts])

  const handleBulkDeleteContacts = useCallback((contactIds: string[]) => {
    try {
      contactIds.forEach(id => deleteContact(id))
      setContacts(prev => prev.filter(c => !contactIds.includes(c.id)))
      setFilteredContacts(prev => prev.filter(c => !contactIds.includes(c.id)))
      setSelectedContacts(prev => prev.filter(c => !contactIds.includes(c.id)))
    } catch (error) {
      console.error('Error bulk deleting contacts:', error)
      alert('Failed to delete some contacts')
    }
  }, [])

  const handleAddConnection = useCallback((contactId: string, connection: Connection) => {
    try {
      const updatedContact = contacts.find(c => c.id === contactId)
      if (!updatedContact) return

      const newContact = {
        ...updatedContact,
        connections: [...(updatedContact.connections || []), connection],
        updatedAt: new Date()
      }

      updateContact(newContact)
      setContacts(prev => prev.map(c => c.id === contactId ? newContact : c))
      setFilteredContacts(prev => prev.map(c => c.id === contactId ? newContact : c))
    } catch (error) {
      console.error('Error adding connection:', error)
      alert('Failed to add connection')
    }
  }, [contacts])

  const handleRemoveConnection = useCallback((contactId: string, targetContactId: string) => {
    try {
      const updatedContact = contacts.find(c => c.id === contactId)
      if (!updatedContact) return

      const newContact = {
        ...updatedContact,
        connections: (updatedContact.connections || []).filter(c => c.contactId !== targetContactId),
        updatedAt: new Date()
      }

      updateContact(newContact)
      setContacts(prev => prev.map(c => c.id === contactId ? newContact : c))
      setFilteredContacts(prev => prev.map(c => c.id === contactId ? newContact : c))
    } catch (error) {
      console.error('Error removing connection:', error)
      alert('Failed to remove connection')
    }
  }, [contacts])

  const handleManageConnections = useCallback((contact: Contact) => {
    setSelectedContact(contact)
    setShowConnectionModal(true)
  }, [])

  const handleBulkUpdateContacts = useCallback((contactIds: string[], updates: Partial<Contact>) => {
    try {
      const updatedContacts = contacts.map(contact => {
        if (contactIds.includes(contact.id)) {
          const updated = { ...contact, ...updates, updatedAt: new Date() }
          updateContact(updated)
          return updated
        }
        return contact
      })
      
      setContacts(updatedContacts)
      setFilteredContacts(updatedContacts)
      setSelectedContacts(prev => prev.map(contact => {
        if (contactIds.includes(contact.id)) {
          return { ...contact, ...updates, updatedAt: new Date() }
        }
        return contact
      }))
    } catch (error) {
      console.error('Error bulk updating contacts:', error)
      alert('Failed to update some contacts')
    }
  }, [contacts])

  const handleImportContacts = useCallback((importedContacts: Contact[]) => {
    try {
      // Add imported contacts to localStorage and state
      importedContacts.forEach(contact => {
        addContact(contact)
      })
      
      setContacts(prev => [...prev, ...importedContacts])
      setFilteredContacts(prev => [...prev, ...importedContacts])
      
      // Show success toast
      showSuccessToast.contactsImported(importedContacts.length)
    } catch (error) {
      console.error('Error importing contacts:', error)
      showErrorToast.importFailed()
    }
  }, [])

  const handleFilterChange = useCallback((filtered: Contact[]) => {
    setFilteredContacts(filtered)
  }, [])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Header */}
        <header className="glass-card shadow-modern border-b border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold gradient-text transition-colors duration-300">Gary Vee Network</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Enterprise relationship management</p>
                </div>
              </div>
            
            <div className="flex items-center gap-2">
              {/* User Info */}
              {user && (
                <div className="flex items-center gap-2 mr-4">
                  <Badge className={`text-xs ${getTeamColor(user.team)}`}>
                    {user.team}
                  </Badge>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user.username}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Logout
                  </Button>
                </div>
              )}
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'bulk' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('bulk')}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'network' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('network')}
                  className="h-8 px-3"
                >
                  <Network className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'insights' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('insights')}
                  className="h-8 px-3"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </div>

              {/* Import/Export Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import
              </Button>
              
              <ExportButton contacts={filteredContacts} />
              
              {/* Voice Notes Demo Button */}
              <Button
                onClick={() => setShowVoiceNotesDemo(true)}
                variant="outline"
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Mic className="w-4 h-4" />
                Voice Demo
              </Button>
              
              {/* Add Contact Button */}
              <Button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Analytics Bar */}
      <div className="glass-card border-b border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300">
        <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Desktop Analytics */}
              <div className="hidden md:block">
                <HeaderAnalytics contacts={contacts} />
              </div>
              
              {/* Mobile Analytics */}
              <div className="md:hidden">
                <HeaderAnalyticsMobile contacts={contacts} />
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6 py-8">
        <div className="space-y-8">
          {/* Search and Filters */}
          <AdvancedSearch
            contacts={contacts}
            onFilterChange={handleFilterChange}
            activeFilters={activeFilters}
            onActiveFiltersChange={setActiveFilters}
          />

          {/* Contact Display */}
          {viewMode === 'grid' && (
            <>
              {loading ? (
                <ContactGridSkeleton />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {filteredContacts.map(contact => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onEdit={handleEditContact}
                      onDelete={handleDeleteContact}
                      onManageConnections={handleManageConnections}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {viewMode === 'bulk' && (
            <BulkOperations
              contacts={filteredContacts}
              selectedContacts={selectedContacts}
              onSelectionChange={setSelectedContacts}
              onDeleteContacts={handleBulkDeleteContacts}
              onUpdateContacts={handleBulkUpdateContacts}
            />
          )}

          {viewMode === 'network' && (
            <NetworkVisualization
              contacts={contacts}
              onContactSelect={handleManageConnections}
              selectedContactId={selectedContact?.id}
            />
          )}

          {viewMode === 'insights' && (
            <NetworkInsights
              contacts={contacts}
              onContactSelect={handleManageConnections}
              onAddConnection={(contact1, contact2) => {
                const connection: Connection = {
                  contactId: contact2.id,
                  strength: 'medium',
                  type: 'business',
                  createdAt: new Date()
                }
                handleAddConnection(contact1.id, connection)
              }}
            />
          )}

          {/* Empty State */}
          {filteredContacts.length === 0 && contacts.length > 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">No contacts match your current filters.</p>
            </div>
          )}

          {contacts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">No contacts yet. Add your first contact to get started!</p>
            </div>
          )}
        </div>
      </main>

      {/* AI Chat */}
      <AIChat contacts={filteredContacts} />

              {/* Modals */}
        <AddContactModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onAdd={handleAddContact}
        />
        
        {/* Voice Notes Demo Modal */}
        {showVoiceNotesDemo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Voice Notes Demo</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowVoiceNotesDemo(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              <VoiceNotesDemo />
            </div>
          </div>
        )}

      <EditContactModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        contact={selectedContact}
        onUpdate={handleUpdateContact}
      />

      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        contact={selectedContact}
        onConfirm={handleConfirmDeleteContact}
      />

      <ImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImport={handleImportContacts}
        existingContacts={contacts}
      />

      <ConnectionModal
        open={showConnectionModal}
        onOpenChange={setShowConnectionModal}
        contact={selectedContact}
        allContacts={contacts}
        onAddConnection={handleAddConnection}
        onRemoveConnection={handleRemoveConnection}
      />
      </div>
    </ProtectedRoute>
  )
}
