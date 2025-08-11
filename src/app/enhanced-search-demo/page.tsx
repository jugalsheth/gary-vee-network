'use client'

import { useState, useEffect } from 'react'
import { Search, Command, Filter, TrendingUp, Users, MapPin, Star, Building, Calendar, Zap, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { Contact, GlobalFilters } from '@/lib/types'

// Mock data for demo
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1-555-0123',
    contactType: 'business',
    tier: 'tier1',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    location: 'New York',
    relationshipToGary: 'Business Partner',
    hasKids: true,
    isMarried: true,
    interests: ['technology', 'business', 'networking'],
    notes: 'Met at conference, interested in partnership',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'system'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@startup.io',
    phone: '+1-555-0456',
    contactType: 'business',
    tier: 'tier2',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    location: 'San Francisco',
    relationshipToGary: 'Startup Founder',
    hasKids: false,
    isMarried: false,
    interests: ['startups', 'scaling', 'innovation'],
    notes: 'Great conversation about scaling',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    createdBy: 'system'
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@enterprise.com',
    phone: '+1-555-0789',
    contactType: 'business',
    tier: 'tier1',
    city: 'Boston',
    state: 'MA',
    country: 'USA',
    location: 'Boston',
    relationshipToGary: 'Enterprise CTO',
    hasKids: true,
    isMarried: true,
    interests: ['AI', 'enterprise', 'technology'],
    notes: 'Technical discussion about AI implementation',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'system'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@creative.art',
    phone: '+1-555-0321',
    contactType: 'influencer',
    tier: 'tier3',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    location: 'Los Angeles',
    relationshipToGary: 'Creative Director',
    hasKids: false,
    isMarried: true,
    interests: ['design', 'creativity', 'art'],
    notes: 'Creative collaboration opportunity',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-16'),
    createdBy: 'system'
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david@finance.bank',
    phone: '+1-555-0654',
    contactType: 'business',
    tier: 'tier2',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    location: 'Chicago',
    relationshipToGary: 'Finance VP',
    hasKids: true,
    isMarried: true,
    interests: ['finance', 'strategy', 'banking'],
    notes: 'Financial partnership discussions',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-14'),
    createdBy: 'system'
  }
]

export default function EnhancedSearchDemoPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Contact[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<GlobalFilters>({
    selectedTiers: [],
    selectedTeams: [],
    hasKids: null,
    isMarried: null,
    locations: [],
    dateRange: null,
    customFilters: {}
  })
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // Simulate search functionality
  const performSearch = async (query: string, filters: GlobalFilters) => {
    setIsSearching(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let results = mockContacts.filter(contact => {
      // Basic text search
      const matchesQuery = query === '' || 
        contact.name.toLowerCase().includes(query.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(query.toLowerCase())) ||
        contact.location?.toLowerCase().includes(query.toLowerCase()) ||
        contact.notes.toLowerCase().includes(query.toLowerCase())
      
      // Apply filters
      const matchesTier = filters.selectedTiers.length === 0 || 
        filters.selectedTiers.includes(contact.tier)
      const matchesLocation = filters.locations.length === 0 || 
        (contact.location && filters.locations.includes(contact.location))
      const matchesHasKids = filters.hasKids === null || contact.hasKids === filters.hasKids
      const matchesIsMarried = filters.isMarried === null || contact.isMarried === filters.isMarried
      
      return matchesQuery && matchesTier && matchesLocation && matchesHasKids && matchesIsMarried
    })
    
    setSearchResults(results)
    setIsSearching(false)
    
    // Add to search history
    if (query && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 9)])
    }
  }

  // Handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    performSearch(query, filters)
  }

  // Handle filter changes
  const handleFilterChange = (key: keyof GlobalFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    performSearch(searchQuery, newFilters)
  }

  // Handle tier selection
  const handleTierChange = (tier: 'tier1' | 'tier2' | 'tier3') => {
    const newTiers = filters.selectedTiers.includes(tier)
      ? filters.selectedTiers.filter(t => t !== tier)
      : [...filters.selectedTiers, tier]
    handleFilterChange('selectedTiers', newTiers)
  }

  // Handle location selection
  const handleLocationChange = (location: string) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter(l => l !== location)
      : [...filters.locations, location]
    handleFilterChange('locations', newLocations)
  }

  // Global command palette shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Initial search
  useEffect(() => {
    performSearch('', filters)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Global Command Palette */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="glass-premium shadow-premium rounded-xl w-full max-w-lg mx-auto p-4">
            <Input
              className="w-full p-3 rounded-lg bg-white/80 dark:bg-gray-900/80 text-lg outline-none mb-2"
              placeholder="Type a command or search contacts..."
              aria-label="Command palette search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <ul className="max-h-72 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-800">
              {searchHistory.map((query, index) => (
                <li key={index} className="py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <span>{query}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-2 text-xs text-gray-400 flex justify-between">
              <span>Cmd+K to open • Esc to close • ↑↓ to navigate</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setShowCommandPalette(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Enhanced Search Experience
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Powerful search with smart suggestions, advanced filters, and global command palette
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Command className="w-4 h-4" />
            <span>Press Cmd+K to open global search</span>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  className="pl-10 pr-4 py-3 text-lg"
                  placeholder="Search contacts by name, email, location, or notes..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {/* Advanced Filters */}
            <Collapsible open={showFilters} className="mt-4">
              <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tiers</label>
                    <div className="space-y-2">
                      {(['tier1', 'tier2', 'tier3'] as const).map((tier) => (
                        <div key={tier} className="flex items-center space-x-2">
                          <Checkbox
                            id={tier}
                            checked={filters.selectedTiers.includes(tier)}
                            onCheckedChange={() => handleTierChange(tier)}
                          />
                          <label htmlFor={tier} className="text-sm">
                            {tier === 'tier1' ? 'Tier 1' : tier === 'tier2' ? 'Tier 2' : 'Tier 3'}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Locations</label>
                    <div className="space-y-2">
                      {['New York', 'San Francisco', 'Boston', 'Los Angeles', 'Chicago'].map((location) => (
                        <div key={location} className="flex items-center space-x-2">
                          <Checkbox
                            id={location}
                            checked={filters.locations.includes(location)}
                            onCheckedChange={() => handleLocationChange(location)}
                          />
                          <label htmlFor={location} className="text-sm">{location}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Personal Status</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasKids"
                          checked={filters.hasKids === true}
                          onCheckedChange={(checked) => handleFilterChange('hasKids', checked ? true : null)}
                        />
                        <label htmlFor="hasKids" className="text-sm">Has Kids</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isMarried"
                          checked={filters.isMarried === true}
                          onCheckedChange={(checked) => handleFilterChange('isMarried', checked ? true : null)}
                        />
                        <label htmlFor="isMarried" className="text-sm">Is Married</label>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Search Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Results List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Search Results
              </h2>
              <Badge variant="secondary">
                {searchResults.length} contacts found
              </Badge>
            </div>

            {isSearching ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((contact) => (
                  <Card key={contact.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                            {contact.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {contact.contactType === 'business' ? contact.relationshipToGary : 'Influencer'} • {contact.location}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{contact.location}</span>
                            <Star className="w-4 h-4" />
                            <span>{contact.tier === 'tier1' ? 'Tier 1' : contact.tier === 'tier2' ? 'Tier 2' : 'Tier 3'}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={contact.tier === 'tier1' ? 'default' : contact.tier === 'tier2' ? 'secondary' : 'outline'}>
                            {contact.tier === 'tier1' ? 'Tier 1' : contact.tier === 'tier2' ? 'Tier 2' : 'Tier 3'}
                          </Badge>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No contacts found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search terms or filters
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Search Analytics */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Search Analytics
            </h2>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Search Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total searches today</span>
                      <span className="font-semibold">{searchHistory.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Average results</span>
                      <span className="font-semibold">{searchResults.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Active filters</span>
                      <span className="font-semibold">
                        {filters.selectedTiers.length + filters.locations.length + 
                         (filters.hasKids !== null ? 1 : 0) + (filters.isMarried !== null ? 1 : 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Recent Searches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {searchHistory.length > 0 ? (
                    <div className="space-y-2">
                      {searchHistory.slice(0, 5).map((query, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{query}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSearch(query)}
                          >
                            <Search className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No recent searches</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowCommandPalette(true)}
                    >
                      <Command className="w-4 h-4 mr-2" />
                      Open Global Search
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowFilters(true)}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Show All Filters
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setSearchQuery('')
                        setFilters({
                          selectedTiers: [],
                          selectedTeams: [],
                          hasKids: null,
                          isMarried: null,
                          locations: [],
                          dateRange: null,
                          customFilters: {}
                        })
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 