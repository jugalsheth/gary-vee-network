'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import type { Contact, Tier } from '@/lib/types'
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useMemo, useState, useCallback } from 'react'

interface AdvancedSearchProps {
  contacts: Contact[]
  onFilterChange: (filteredContacts: Contact[]) => void
  activeFilters: FilterState
  onActiveFiltersChange: (filters: FilterState) => void
}

export interface FilterState {
  searchText: string
  tier: 'all' | Tier
  hasKids: boolean | null
  isMarried: boolean | null
  location: 'all' | string
  interests: string[]
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function AdvancedSearch({ contacts, onFilterChange, activeFilters, onActiveFiltersChange }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const debouncedSearchText = useDebounce(activeFilters.searchText, 300)

  // Get unique locations and interests for filter options
  const uniqueLocations = useMemo(() => {
    const locations = contacts
      .map(c => c.location)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort()
    return locations
  }, [contacts])

  const allInterests = useMemo(() => {
    const interests = contacts.flatMap(c => c.interests || [])
    return [...new Set(interests)].filter(Boolean).sort()
  }, [contacts])

  // Apply filters
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Search text filter
      if (debouncedSearchText) {
        const searchLower = debouncedSearchText.toLowerCase()
        const searchableFields = [
          contact.name,
          contact.email,
          contact.relationshipToGary,
          contact.location,
          contact.notes,
          ...(contact.interests || [])
        ].filter(Boolean).join(' ').toLowerCase()
        
        if (!searchableFields.includes(searchLower)) {
          return false
        }
      }

      // Tier filter
      if (activeFilters.tier !== 'all' && contact.tier !== activeFilters.tier) {
        return false
      }

      // Has Kids filter
      if (activeFilters.hasKids !== null && contact.hasKids !== activeFilters.hasKids) {
        return false
      }

      // Is Married filter
      if (activeFilters.isMarried !== null && contact.isMarried !== activeFilters.isMarried) {
        return false
      }

      // Location filter
      if (activeFilters.location !== 'all' && contact.location !== activeFilters.location) {
        return false
      }

      // Interests filter
      if (activeFilters.interests.length > 0) {
        const hasMatchingInterest = activeFilters.interests.some(interest => 
          (contact.interests || []).includes(interest)
        )
        if (!hasMatchingInterest) {
          return false
        }
      }

      return true
    })
  }, [contacts, debouncedSearchText, activeFilters])

  // Update parent component when filters change
  React.useEffect(() => {
    onFilterChange(filteredContacts)
  }, [filteredContacts, onFilterChange])

  const handleSearchChange = useCallback((value: string) => {
    onActiveFiltersChange({ ...activeFilters, searchText: value })
  }, [activeFilters, onActiveFiltersChange])

  const handleTierChange = useCallback((value: 'all' | Tier) => {
    onActiveFiltersChange({ ...activeFilters, tier: value })
  }, [activeFilters, onActiveFiltersChange])

  const handleHasKidsChange = useCallback((checked: boolean | 'indeterminate') => {
    onActiveFiltersChange({ ...activeFilters, hasKids: checked === true ? true : null })
  }, [activeFilters, onActiveFiltersChange])

  const handleIsMarriedChange = useCallback((checked: boolean | 'indeterminate') => {
    onActiveFiltersChange({ ...activeFilters, isMarried: checked === true ? true : null })
  }, [activeFilters, onActiveFiltersChange])

  const handleLocationChange = useCallback((value: string) => {
    onActiveFiltersChange({ ...activeFilters, location: value || '' })
  }, [activeFilters, onActiveFiltersChange])

  const handleInterestToggle = useCallback((interest: string) => {
    const newInterests = activeFilters.interests.includes(interest)
      ? activeFilters.interests.filter(i => i !== interest)
      : [...activeFilters.interests, interest]
    onActiveFiltersChange({ ...activeFilters, interests: newInterests })
  }, [activeFilters, onActiveFiltersChange])

  const clearAllFilters = useCallback(() => {
    onActiveFiltersChange({
      searchText: '',
      tier: 'all',
      hasKids: null,
      isMarried: null,
      location: 'all',
      interests: []
    })
  }, [onActiveFiltersChange])

  const activeFilterCount = [
    activeFilters.searchText ? 1 : 0,
    activeFilters.tier !== 'all' ? 1 : 0,
    activeFilters.hasKids !== null ? 1 : 0,
    activeFilters.isMarried !== null ? 1 : 0,
    activeFilters.location !== 'all' ? 1 : 0,
    activeFilters.interests.length
  ].reduce((sum, count) => sum + count, 0)

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 transition-colors duration-300" />
        <Input
          value={activeFilters.searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search contacts by name, email, notes, location..."
          className="pl-10 pr-4 glass-card rounded-modern shadow-modern transition-modern focus:shadow-modern-hover"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tier Filter */}
        <Select value={activeFilters.tier} onValueChange={handleTierChange}>
          <SelectTrigger className="w-auto min-w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="tier1">Tier 1</SelectItem>
            <SelectItem value="tier2">Tier 2</SelectItem>
            <SelectItem value="tier3">Tier 3</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters Toggle */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Advanced
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 glass-card rounded-modern shadow-modern">
              {/* Has Kids Filter */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasKids"
                  checked={activeFilters.hasKids === true}
                  onCheckedChange={handleHasKidsChange}
                />
                <label htmlFor="hasKids" className="text-sm font-medium">Has Kids</label>
              </div>

              {/* Is Married Filter */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isMarried"
                  checked={activeFilters.isMarried === true}
                  onCheckedChange={handleIsMarriedChange}
                />
                <label htmlFor="isMarried" className="text-sm font-medium">Is Married</label>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={activeFilters.location} onValueChange={handleLocationChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {uniqueLocations.filter(Boolean).map(location => (
                      <SelectItem key={location} value={location as string}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Interests Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Interests</label>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {allInterests.map(interest => (
                    <Badge
                      key={interest}
                      variant={activeFilters.interests.includes(interest) ? "default" : "secondary"}
                      className="cursor-pointer text-xs"
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
            >
              <X className="w-3 h-3 mr-1" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredContacts.length} of {contacts.length} contacts
      </div>
    </div>
  )
} 