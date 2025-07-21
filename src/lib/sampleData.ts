import type { Contact } from './types'
import { generateUniqueId } from './utils'

export const sampleContacts: Contact[] = [
  {
    id: '1',
    name: 'Jane Doe',
    tier: 'tier1',
    email: 'jane@example.com',
    phone: '+1 555-1234',
    relationshipToGary: 'Business Partner',
    hasKids: true,
    isMarried: true,
    location: 'New York, NY',
    interests: ['Marketing', 'Startups', 'Wine'],
    notes: 'Jane is a long-time collaborator and trusted advisor. She has deep expertise in marketing and has helped Gary with several ventures.',
    socialHandles: { instagram: 'janedoe', linkedin: 'jane-doe' },
    connections: [
      { contactId: '2', strength: 'strong', type: 'business', createdAt: new Date() },
      { contactId: '4', strength: 'medium', type: 'business', createdAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    addedBy: 'gary',
  },
  {
    id: '2',
    name: 'Mike Smith',
    tier: 'tier2',
    email: 'mike@startup.com',
    phone: '+1 555-5678',
    relationshipToGary: 'Investor',
    hasKids: false,
    isMarried: false,
    location: 'San Francisco, CA',
    interests: ['Tech', 'AI', 'Running'],
    notes: 'Mike is an early investor and tech enthusiast. Loves running marathons and exploring new AI trends.',
    socialHandles: { twitter: 'mikesmith' },
    connections: [
      { contactId: '1', strength: 'strong', type: 'business', createdAt: new Date() },
      { contactId: '3', strength: 'weak', type: 'business', createdAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    addedBy: 'gary',
  },
  {
    id: '3',
    name: 'Lisa Green',
    tier: 'tier3',
    email: 'lisa.green@agency.com',
    phone: '+1 555-8765',
    relationshipToGary: 'Agency Partner',
    hasKids: true,
    isMarried: false,
    location: 'Chicago, IL',
    interests: ['Advertising', 'Travel'],
    notes: 'Lisa runs a top agency and has worked with Gary on multiple campaigns. Loves to travel.',
    socialHandles: { instagram: 'lisagreen' },
    connections: [
      { contactId: '2', strength: 'weak', type: 'business', createdAt: new Date() },
      { contactId: '5', strength: 'medium', type: 'business', createdAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    addedBy: 'gary',
  },
  {
    id: '4',
    name: 'Carlos Rivera',
    tier: 'tier1',
    email: 'carlos@media.com',
    phone: '+1 555-4321',
    relationshipToGary: 'Media Contact',
    hasKids: false,
    isMarried: true,
    location: 'Miami, FL',
    interests: ['Media', 'Soccer'],
    notes: 'Carlos is a key media contact and passionate about soccer.',
    socialHandles: { twitter: 'carlosr' },
    connections: [
      { contactId: '1', strength: 'medium', type: 'business', createdAt: new Date() },
      { contactId: '5', strength: 'weak', type: 'business', createdAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    addedBy: 'gary',
  },
  {
    id: '5',
    name: 'Priya Patel',
    tier: 'tier2',
    email: 'priya@events.com',
    phone: '+1 555-2468',
    relationshipToGary: 'Event Organizer',
    hasKids: true,
    isMarried: true,
    location: 'Austin, TX',
    interests: ['Events', 'Food'],
    notes: 'Priya organizes major events for Gary and is a foodie at heart.',
    socialHandles: { linkedin: 'priya-patel' },
    connections: [
      { contactId: '3', strength: 'medium', type: 'business', createdAt: new Date() },
      { contactId: '4', strength: 'weak', type: 'business', createdAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    addedBy: 'gary',
  },
  {
    id: '6',
    name: 'Tom Lee',
    tier: 'tier3',
    email: 'tom.lee@network.com',
    phone: '+1 555-1357',
    relationshipToGary: 'General Network',
    hasKids: false,
    isMarried: false,
    location: 'Seattle, WA',
    interests: ['Networking', 'Coffee'],
    notes: 'Tom is a new addition to the network and loves coffee meetups.',
    socialHandles: {},
    connections: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    addedBy: 'gary',
  },
]

// Function to initialize sample data if no contacts exist
export function initializeSampleData(): Contact[] {
  return sampleContacts.map(contact => ({
    ...contact,
    id: generateUniqueId(), // Ensure unique IDs for each initialization
    createdAt: new Date(),
    updatedAt: new Date(),
  }))
} 