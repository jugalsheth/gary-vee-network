'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Filter, X, Clock, Star, TrendingUp, MapPin, Users, Building, Calendar, Save, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Contact, GlobalFilters } from '@/lib/types'
import { debounce } from 'lodash'

interface EnhancedSearchProps {
  contacts: Contact[]
  onSearchResults: (results: Contact[]) => void
  onFiltersChange: (filters: GlobalFilters) => void
  className?: string
}

interface SearchSuggestion {
  type: 'contact' | 'location' | 'interest' | 'tag'
  value: string
  count: number
  icon: React.ReactNode
}

interface SearchHistoryItem {
  query: string
  timestamp: Date
  resultCount: number
}

export function EnhancedSearch({
  contacts,
  onSearchResults,
  onFiltersChange,
  className
}: EnhancedSearchProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [savedSearches, setSavedSearches] = useState<string[]>([])

  // Filter state
  const [filters, setFilters] = useState<GlobalFilters>({
    selectedTiers: [],
    selectedTeams: [],
    hasKids: null,
    isMarried: null,
    locations: [],
    dateRange: null,
    customFilters: {}
  })

  // Advanced filter visibility
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Search suggestions
  const searchSuggestions = useMemo((): SearchSuggestion[] => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    const suggestions: SearchSuggestion[] = []

    // Contact name suggestions
    contacts.forEach(contact => {
      if (contact.name.toLowerCase().includes(query)) {
        suggestions.push({
          type: 'contact',
          value: contact.name,
          count: 1,
          icon: <Users className="w-4 h-4" />
        })
      }
    })

    // Location suggestions
    const locations = new Set<string>()
    contacts.forEach(contact => {
      if (contact.location?.toLowerCase().includes(query) || contact.city?.toLowerCase().includes(query)) {
        const location = contact.location || contact.city || ''
        if (location && !locations.has(location)) {
          locations.add(location)
          suggestions.push({
            type: 'location',
            value: location,
            count: contacts.filter(c => (c.location === location || c.city === location)).length,
            icon: <MapPin className="w-4 h-4" />
          })
        }
      }
    })

    // Interest suggestions
    contacts.forEach(contact => {
      contact.interests?.forEach(interest => {
        if (interest.toLowerCase().includes(query)) {
          const existing = suggestions.find(s => s.type === 'interest' && s.value === interest)
          if (existing) {
            existing.count++
          } else {
            suggestions.push({
              type: 'interest',
              value: interest,
              count: 1,
              icon: <Star className="w-4 h-4" />
            })
          }
        }
      })
    })

    // Remove duplicates and sort by relevance
    const uniqueSuggestions = suggestions.filter((s, index, arr) => 
      arr.findIndex(item => item.value === s.value) === index
    )

    return uniqueSuggestions
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [searchQuery, contacts])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string, currentFilters: GlobalFilters) => {
      if (!query.trim() && Object.keys(currentFilters).length === 0) {
        onSearchResults(contacts)
        return
      }

      setIsSearching(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))

      let results = contacts

      // Apply search query
      if (query.trim()) {
        const searchTerms = query.toLowerCase().split(' ')
        results = results.filter(contact => {
          const searchableText = [
            contact.name,
            contact.email,
            contact.phone,
            contact.location,
            contact.city,
            contact.relationshipToGary,
            contact.notes,
            ...(contact.interests || [])
          ].join(' ').toLowerCase()

          return searchTerms.every(term => searchableText.includes(term))
        })
      }

      // Apply filters
      if (currentFilters.selectedTiers.length > 0) {
        results = results.filter(contact => currentFilters.selectedTiers.includes(contact.tier))
      }

      if (currentFilters.selectedTeams.length > 0) {
        results = results.filter(contact => contact.team && currentFilters.selectedTeams.includes(contact.team))
      }

      if (currentFilters.hasKids !== null) {
        results = results.filter(contact => contact.hasKids === currentFilters.hasKids)
      }

      if (currentFilters.isMarried !== null) {
        results = results.filter(contact => contact.isMarried === currentFilters.isMarried)
      }

      if (currentFilters.locations.length > 0) {
        results = results.filter(contact => 
          contact.location && currentFilters.locations.includes(contact.location) ||
          contact.city && currentFilters.locations.includes(contact.city)
        )
      }

      if (currentFilters.dateRange) {
        results = results.filter(contact => {
          const contactDate = new Date(contact.createdAt)
          return contactDate >= currentFilters.dateRange!.start && contactDate <= currentFilters.dateRange!.end
        })
      }

      setIsSearching(false)
      onSearchResults(results)

      // Add to search history
      if (query.trim()) {
        const historyItem: SearchHistoryItem = {
          query: query.trim(),
          timestamp: new Date(),
          resultCount: results.length
        }
        setSearchHistory(prev => [historyItem, ...prev.slice(0, 9)])
      }
    }, 300),
    [contacts, onSearchResults]
  )

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setShowSuggestions(query.length > 0)
    debouncedSearch(query, filters)
  }

  // Handle filter change
  const handleFilterChange = (newFilters: Partial<GlobalFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
    debouncedSearch(searchQuery, updatedFilters)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.value)
    setShowSuggestions(false)
    debouncedSearch(suggestion.value, filters)
  }

  // Handle history item selection
  const handleHistorySelect = (historyItem: SearchHistoryItem) => {
    setSearchQuery(historyItem.query)
    setShowSuggestions(false)
    debouncedSearch(historyItem.query, filters)
  }

  // Save current search
  const handleSaveSearch = () => {
    if (searchQuery.trim() && !savedSearches.includes(searchQuery.trim())) {
      setSavedSearches(prev => [...prev, searchQuery.trim()])
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    const clearedFilters: GlobalFilters = {
      selectedTiers: [],
      selectedTeams: [],
      hasKids: null,
      isMarried: null,
      locations: [],
      dateRange: null,
      customFilters: {}
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    debouncedSearch(searchQuery, clearedFilters)
  }

  // Get available filter options
  const availableTiers = useMemo(() => {
    const tiers = new Set(contacts.map(c => c.tier))
    return Array.from(tiers)
  }, [contacts])

  const availableTeams = useMemo(() => {
    const teams = new Set(contacts.map(c => c.team).filter(Boolean))
    return Array.from(teams)
  }, [contacts])

  const availableLocations = useMemo(() => {
    const locations = new Set([
      ...contacts.map(c => c.location).filter(Boolean),
      ...contacts.map(c => c.city).filter(Boolean)
    ])
    return Array.from(locations)
  }, [contacts])

  return (
    <TooltipProvider>
      <div className={`space-y-4 ${className}`}>
        {/* Search Bar */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search contacts, locations, interests..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              className="pl-10 pr-20 h-12 text-lg"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSearchChange('')}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-8 px-3 ${showFilters ? 'bg-blue-100 text-blue-600' : ''}`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
              </Button>
            </div>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {searchSuggestions.length > 0 ? (
                <div className="p-2">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${index}`}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors text-left"
                    >
                      {suggestion.icon}
                      <div className="flex-1">
                        <div className="font-medium">{suggestion.value}</div>
                        <div className="text-sm text-gray-500 capitalize">
                          {suggestion.type} • {suggestion.count} result{suggestion.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No suggestions found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Search Filters</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveSearch}
                    disabled={!searchQuery.trim()}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save Search
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Tier Filter */}
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select
                    value={filters.selectedTiers.join(',')}
                    onValueChange={(value) => handleFilterChange({
                      selectedTiers: value ? value.split(',') : []
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Tiers</SelectItem>
                      {availableTiers.map(tier => (
                        <SelectItem key={tier} value={tier}>
                          {tier === 'tier1' ? 'Tier 1' : tier === 'tier2' ? 'Tier 2' : 'Tier 3'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Team Filter */}
                <div className="space-y-2">
                  <Label>Team</Label>
                  <Select
                    value={filters.selectedTeams.join(',')}
                    onValueChange={(value) => handleFilterChange({
                      selectedTeams: value ? value.split(',') : []
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Teams" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Teams</SelectItem>
                      {availableTeams.map(team => (
                        <SelectItem key={team} value={team}>{team}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select
                    value={filters.locations.join(',')}
                    onValueChange={(value) => handleFilterChange({
                      locations: value ? value.split(',') : []
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Locations</SelectItem>
                      {availableLocations.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Contact Type Filter */}
                <div className="space-y-2">
                  <Label>Contact Type</Label>
                  <Select
                    value={filters.customFilters.contactType || ''}
                    onValueChange={(value) => handleFilterChange({
                      customFilters: { ...filters.customFilters, contactType: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="influencer">Influencer</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-full justify-between"
                >
                  <span>Advanced Filters</span>
                  <span className={`transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </Button>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Personal Status Filters */}
                    <div className="space-y-3">
                      <Label>Personal Status</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasKids"
                            checked={filters.hasKids === true}
                            onCheckedChange={(checked) => handleFilterChange({
                              hasKids: checked ? true : null
                            })}
                          />
                          <Label htmlFor="hasKids">Has Kids</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isMarried"
                            checked={filters.isMarried === true}
                            onCheckedChange={(checked) => handleFilterChange({
                              isMarried: checked ? true : null
                            })}
                          />
                          <Label htmlFor="isMarried">Married</Label>
                        </div>
                      </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-2">
                      <Label>Created Date Range</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          placeholder="Start Date"
                          value={filters.dateRange?.start?.toISOString().split('T')[0] || ''}
                          onChange={(e) => {
                            const start = e.target.value ? new Date(e.target.value) : null
                            const end = filters.dateRange?.end || null
                            handleFilterChange({
                              dateRange: start || end ? { start: start || new Date(0), end: end || new Date() } : null
                            })
                          }}
                        />
                        <Input
                          type="date"
                          placeholder="End Date"
                          value={filters.dateRange?.end?.toISOString().split('T')[0] || ''}
                          onChange={(e) => {
                            const end = e.target.value ? new Date(e.target.value) : null
                            const start = filters.dateRange?.start || null
                            handleFilterChange({
                              dateRange: start || end ? { start: start || new Date(0), end: end || new Date() } : null
                            })
                          }}
                        />
                      </div>
                    </div>

                    {/* Active Filters Display */}
                    <div className="space-y-2">
                      <Label>Active Filters</Label>
                      <div className="space-y-1">
                        {filters.selectedTiers.length > 0 && (
                          <Badge variant="secondary" className="mr-1">
                            {filters.selectedTiers.length} Tier{filters.selectedTiers.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        {filters.selectedTeams.length > 0 && (
                          <Badge variant="secondary" className="mr-1">
                            {filters.selectedTeams.length} Team{filters.selectedTeams.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        {filters.locations.length > 0 && (
                          <Badge variant="secondary" className="mr-1">
                            {filters.locations.length} Location{filters.locations.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        {filters.hasKids !== null && (
                          <Badge variant="secondary">
                            {filters.hasKids ? 'Has Kids' : 'No Kids'}
                          </Badge>
                        )}
                        {filters.isMarried !== null && (
                          <Badge variant="secondary">
                            {filters.isMarried ? 'Married' : 'Single'}
                          </Badge>
                        )}
                        {filters.dateRange && (
                          <Badge variant="secondary">
                            Date Range
                          </Badge>
                        )}
                        {Object.keys(filters.customFilters).length === 0 && (
                          <span className="text-sm text-gray-500">No filters applied</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search History & Saved Searches */}
        {(searchHistory.length > 0 || savedSearches.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search History */}
            {searchHistory.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Recent Searches
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistorySelect(item)}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.query}</div>
                        <div className="text-xs text-gray-500">
                          {item.resultCount} results • {item.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Saved Searches
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {savedSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchChange(search)}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{search}</div>
                        <div className="text-xs text-gray-500">Saved search</div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Search Status */}
        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Searching...
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
} 