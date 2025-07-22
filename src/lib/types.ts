// Contact and related types for Gary Vee Network

import type { VoiceNote } from './voiceNotes';

export type Tier = 'tier1' | 'tier2' | 'tier3'

export interface SocialHandles {
  instagram?: string
  twitter?: string
  linkedin?: string
}

export type ConnectionStrength = 'strong' | 'medium' | 'weak'
export type ConnectionType = 'business' | 'personal' | 'family' | 'mutual-interest'

export interface Connection {
  contactId: string
  strength: ConnectionStrength
  type: ConnectionType
  notes?: string
  createdAt: Date | string
}

export interface Contact {
  // Core fields (existing)
  id: string
  name: string
  email?: string
  phone?: string

  // Contact type and tier system
  contactType: 'business' | 'influencer' | 'general'
  tier: 'tier1' | 'tier2' | 'tier3'

  // Location (enhanced)
  city?: string
  state?: string
  country?: string
  location?: string // Keep for backward compatibility

  // Influencer-specific fields
  instagram?: string
  instagramLink?: string
  followerCount?: number
  biography?: string

  // Business contact fields (existing)
  relationshipToGary?: string
  hasKids?: boolean
  isMarried?: boolean
  interests?: string[]

  // Universal fields
  notes: string
  connections?: Connection[]
  voiceNotes?: VoiceNote[]

  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  tags?: string[]
  team?: string; // Added for Snowflake integration
}

// --- Global Analytics Types ---
export interface GlobalAnalytics {
  totalContacts: number
  tier1Count: number
  tier2Count: number
  tier3Count: number
  recentlyAdded: number
  byLocation: Record<string, number>
  byTeam: Record<string, number>
  activityMetrics: ContactActivityMetrics
  // Add more as needed
}

export interface ContactActivityMetrics {
  lastContacted?: Date
  contactFrequency?: number
  // Add more as needed
}

// --- Pagination Types ---
export interface PaginationState {
  currentPage: number
  itemsPerPage: number
  totalPages: number
  totalFilteredResults: number
}

// --- Search Types ---
export interface SearchMetrics {
  query: string
  resultCount: number
  searchTime: number
  topMatches: any[]
  searchCategories: Record<string, number>
}

export interface GlobalSearchState {
  query: string
  results: Contact[]
  isSearching: boolean
  searchMetrics: SearchMetrics
}

// --- Filter Types ---
export interface GlobalFilters {
  selectedTiers: ('tier1' | 'tier2' | 'tier3')[]
  selectedTeams: string[]
  hasKids: boolean | null
  isMarried: boolean | null
  locations: string[]
  dateRange: { start: Date, end: Date } | null
  customFilters: Record<string, any>
}

// --- Global State ---
export interface GlobalContactState {
  allContacts: Contact[]
  filteredContacts: Contact[]
  currentPageContacts: Contact[]
  globalAnalytics: GlobalAnalytics
  pagination: PaginationState
  globalSearch: GlobalSearchState
  globalFilters: GlobalFilters
} 