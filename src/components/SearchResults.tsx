'use client'

import { useState, useMemo } from 'react'
import { Users, MapPin, Star, Building, TrendingUp, Filter, SortAsc, SortDesc, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Contact } from '@/lib/types'
import ContactCard from './ContactCard'

interface SearchResultsProps {
  results: Contact[]
  searchQuery: string
  filters: any
  onContactEdit?: (contact: Contact) => void
  onContactDelete?: (contact: Contact) => void
  className?: string
}

interface SearchHighlight {
  field: string
  value: string
  highlights: string[]
}

export function SearchResults({
  results,
  searchQuery,
  filters,
  onContactEdit,
  onContactDelete,
  className
}: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'tier' | 'date' | 'location'>('relevance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Highlight search terms in text
  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim() || !text) return text

    const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 0)
    let highlightedText = text

    queryTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>')
    })

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />
  }

  // Get search highlights for a contact
  const getSearchHighlights = (contact: Contact): SearchHighlight[] => {
    if (!searchQuery.trim()) return []

    const highlights: SearchHighlight[] = []
    const query = searchQuery.toLowerCase()

    // Check name
    if (contact.name.toLowerCase().includes(query)) {
      highlights.push({
        field: 'name',
        value: contact.name,
        highlights: [contact.name]
      })
    }

    // Check email
    if (contact.email?.toLowerCase().includes(query)) {
      highlights.push({
        field: 'email',
        value: contact.email,
        highlights: [contact.email]
      })
    }

    // Check location
    if (contact.location?.toLowerCase().includes(query) || contact.city?.toLowerCase().includes(query)) {
      const location = contact.location || contact.city || ''
      highlights.push({
        field: 'location',
        value: location,
        highlights: [location]
      })
    }

    // Check interests
    if (contact.interests) {
      const matchingInterests = contact.interests.filter(interest => 
        interest.toLowerCase().includes(query)
      )
      if (matchingInterests.length > 0) {
        highlights.push({
          field: 'interests',
          value: matchingInterests.join(', '),
          highlights: matchingInterests
        })
      }
    }

    // Check notes
    if (contact.notes?.toLowerCase().includes(query)) {
      highlights.push({
        field: 'notes',
        value: contact.notes,
        highlights: [contact.notes]
      })
    }

    return highlights
  }

  // Sort results
  const sortedResults = useMemo(() => {
    let sorted = [...results]

    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'tier':
        sorted.sort((a, b) => a.tier.localeCompare(b.tier))
        break
      case 'date':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'location':
        sorted.sort((a, b) => (a.location || a.city || '').localeCompare(b.location || b.city || ''))
        break
      case 'relevance':
      default:
        // Relevance is already handled by the search algorithm
        break
    }

    if (sortOrder === 'asc' && sortBy !== 'date') {
      sorted.reverse()
    }

    return sorted
  }, [results, sortBy, sortOrder])

  // Get result analytics
  const resultAnalytics = useMemo(() => {
    const analytics = {
      total: results.length,
      byTier: {} as Record<string, number>,
      byLocation: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      hasKids: 0,
      isMarried: 0
    }

    results.forEach(contact => {
      // Count by tier
      analytics.byTier[contact.tier] = (analytics.byTier[contact.tier] || 0) + 1

      // Count by location
      const location = contact.location || contact.city || 'Unknown'
      analytics.byLocation[location] = (analytics.byLocation[location] || 0) + 1

      // Count by type
      analytics.byType[contact.contactType] = (analytics.byType[contact.contactType] || 0) + 1

      // Count personal status
      if (contact.hasKids) analytics.hasKids++
      if (contact.isMarried) analytics.isMarried++
    })

    return analytics
  }, [results])

  // Get active filters count
  const activeFiltersCount = Object.values(filters).reduce((count: number, value: any) => {
    if (Array.isArray(value) && value.length > 0) return count + 1
    if (value !== null && value !== undefined && value !== '') return count + 1
    return count
  }, 0)

  if (results.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? `No contacts match "${searchQuery}"` : 'Try adjusting your search or filters'}
              </p>
            </div>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  // This would clear filters in the parent component
                  console.log('Clear filters clicked')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Search Results
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {results.length} contact{results.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
                {activeFiltersCount > 0 && ` with ${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''} applied`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                  <div className="w-1 h-1 bg-current rounded-sm" />
                  <div className="w-1 h-1 bg-current rounded-sm" />
                  <div className="w-1 h-1 bg-current rounded-sm" />
                  <div className="w-1 h-1 bg-current rounded-sm" />
                </div>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <div className="flex flex-col gap-1 w-4 h-4">
                  <div className="w-full h-1 bg-current rounded-sm" />
                  <div className="w-full h-1 bg-current rounded-sm" />
                  <div className="w-full h-1 bg-current rounded-sm" />
                </div>
              </Button>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="tier">Tier</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Results Analytics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Results Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{resultAnalytics.total}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              
              {Object.entries(resultAnalytics.byTier).map(([tier, count]) => (
                <div key={tier} className="text-center">
                  <div className="text-2xl font-bold text-green-600">{count}</div>
                  <div className="text-sm text-gray-500 capitalize">{tier}</div>
                </div>
              ))}

              {resultAnalytics.hasKids > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{resultAnalytics.hasKids}</div>
                  <div className="text-sm text-gray-500">Has Kids</div>
                </div>
              )}

              {resultAnalytics.isMarried > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{resultAnalytics.isMarried}</div>
                  <div className="text-sm text-gray-500">Married</div>
                </div>
              )}
            </div>

            {/* Top Locations */}
            {Object.keys(resultAnalytics.byLocation).length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Top Locations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(resultAnalytics.byLocation)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([location, count]) => (
                      <Badge key={location} variant="outline">
                        {location} ({count})
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results Grid/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {sortedResults.map((contact) => {
            const highlights = getSearchHighlights(contact)
            
            if (viewMode === 'list') {
              return (
                <Card key={contact.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${
                        contact.tier === 'tier1' ? 'bg-gradient-to-br from-pink-500 to-pink-600' :
                        contact.tier === 'tier2' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                        'bg-gradient-to-br from-green-500 to-green-600'
                      }`}>
                        {contact.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>

                      {/* Contact Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {highlightText(contact.name, searchQuery)}
                          </h3>
                          <Badge variant="outline" className="capitalize">
                            {contact.tier}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {contact.contactType}
                          </Badge>
                        </div>

                        {contact.email && (
                          <p className="text-gray-600 dark:text-gray-400 mb-1">
                            {highlightText(contact.email, searchQuery)}
                          </p>
                        )}

                        {(contact.location || contact.city) && (
                          <p className="text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {highlightText(contact.location || contact.city || '', searchQuery)}
                          </p>
                        )}

                        {/* Search Highlights */}
                        {highlights.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {highlights.map((highlight, index) => (
                              <div key={index} className="text-sm">
                                <span className="text-gray-500 capitalize">{highlight.field}:</span>{' '}
                                <span className="bg-blue-50 dark:bg-blue-900/20 px-1 rounded">
                                  {highlight.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-col gap-2">
                        {onContactEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onContactEdit(contact)}
                          >
                            Edit
                          </Button>
                        )}
                        {onContactDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onContactDelete(contact)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }

            // Grid view - use existing ContactCard
            return (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={onContactEdit}
                onDelete={onContactDelete}
                allContacts={results}
              />
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
} 