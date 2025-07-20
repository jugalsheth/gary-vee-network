// Contact and related types for Gary Vee Network

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
  id: string
  name: string
  tier: Tier // Pink, Yellow, Green
  email?: string
  phone?: string
  relationshipToGary: string
  hasKids: boolean
  isMarried: boolean
  location?: string
  interests?: string[]
  notes?: string // Primary AI context field
  socialHandles?: SocialHandles
  connections?: Connection[] // Network relationships
  voiceNotes?: string[] // Array of voice note IDs
  hasVoiceNotes?: boolean
  createdAt: Date | string // Can be string when retrieved from localStorage
  updatedAt: Date | string // Can be string when retrieved from localStorage
  addedBy: string
} 