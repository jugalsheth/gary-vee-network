'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Command, X, ArrowUp, ArrowDown, Users, MapPin, Star, Building, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { Contact } from '@/lib/types'

interface GlobalSearchCommandPaletteProps {
  contacts: Contact[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onContactSelect?: (contact: Contact) => void
}

interface SearchResult {
  type: 'contact' | 'location' | 'interest' | 'action'
  value: string
  contact?: Contact
  icon: React.ReactNode
  description?: string
}

export function GlobalSearchCommandPalette({
  contacts,
  isOpen,
  onOpenChange,
  onContactSelect
}: GlobalSearchCommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [results, setResults] = useState<SearchResult[]>([])

  // Search results
  const searchResults = useCallback((query: string): SearchResult[] => {
    if (!query.trim()) return []

    const queryLower = query.toLowerCase()
    const results: SearchResult[] = []

    // Contact matches
    contacts.forEach(contact => {
      if (contact.name.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'contact',
          value: contact.name,
          contact,
          icon: <Users className="w-4 h-4" />,
          description: `${contact.tier} • ${contact.contactType} • ${contact.location || contact.city || 'No location'}`
        })
      }
    })

    // Location matches
    const locations = new Set<string>()
    contacts.forEach(contact => {
      if (contact.location?.toLowerCase().includes(queryLower) || contact.city?.toLowerCase().includes(queryLower)) {
        const location = contact.location || contact.city || ''
        if (location && !locations.has(location)) {
          locations.add(location)
          const count = contacts.filter(c => (c.location === location || c.city === location)).length
          results.push({
            type: 'location',
            value: location,
            icon: <MapPin className="w-4 h-4" />,
            description: `${count} contact${count !== 1 ? 's' : ''} in this location`
          })
        }
      }
    })

    // Interest matches
    const interests = new Set<string>()
    contacts.forEach(contact => {
      contact.interests?.forEach(interest => {
        if (interest.toLowerCase().includes(queryLower) && !interests.has(interest)) {
          interests.add(interest)
          const count = contacts.filter(c => c.interests?.includes(interest)).length || 0
          results.push({
            type: 'interest',
            value: interest,
            icon: <Star className="w-4 h-4" />,
            description: `${count} contact${count !== 1 ? 's' : ''} share this interest`
          })
        }
      })
    })

    // Quick actions
    if (queryLower.includes('add') || queryLower.includes('new') || queryLower.includes('create')) {
      results.push({
        type: 'action',
        value: 'Add New Contact',
        icon: <Users className="w-4 h-4" />,
        description: 'Create a new contact in your network'
      })
    }

    if (queryLower.includes('analytics') || queryLower.includes('stats') || queryLower.includes('report')) {
      results.push({
        type: 'action',
        value: 'View Analytics',
        icon: <Building className="w-4 h-4" />,
        description: 'See network insights and statistics'
      })
    }

    return results.slice(0, 10)
  }, [contacts])

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setSelectedIndex(0)
    setResults(searchResults(query))
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          handleResultSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        onOpenChange(false)
        break
    }
  }

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    if (result.type === 'contact' && result.contact && onContactSelect) {
      onContactSelect(result.contact)
      onOpenChange(false)
    } else if (result.type === 'action') {
      // Handle quick actions
      console.log('Quick action:', result.value)
      onOpenChange(false)
    } else {
      // Handle location/interest searches
      console.log('Search for:', result.value)
      onOpenChange(false)
    }
  }

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setSelectedIndex(0)
      setResults([])
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="relative">
          {/* Search Input */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search contacts, locations, interests, or quick actions..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-4 h-12 text-lg border-0 focus:ring-0 focus:ring-offset-0"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">↑↓</kbd>
                  <span>navigate</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">↵</kbd>
                  <span>select</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">esc</kbd>
                  <span>close</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length === 0 && searchQuery ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No results found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Command className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Global Search</p>
                <p className="text-sm">Search for contacts, locations, interests, or quick actions</p>
              </div>
            ) : (
              <div className="p-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${index}`}
                    onClick={() => handleResultSelect(result)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      index === selectedIndex
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {result.value}
                      </div>
                      {result.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {result.description}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="capitalize">
                        {result.type}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {results.length > 0 ? `${results.length} result${results.length !== 1 ? 's' : ''}` : 'Ready to search'}
              </span>
              <span className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Command className="w-3 h-3" />
                  Global Search
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {contacts.length} contacts
                </span>
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 