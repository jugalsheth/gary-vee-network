import type { Contact, Connection, ConnectionStrength } from './types'

export interface NetworkNode {
  id: string
  contact: Contact
  connections: string[]
  degree: number
  isHub: boolean
}

export interface NetworkEdge {
  source: string
  target: string
  strength: ConnectionStrength
  type: string
  bidirectional: boolean
}

export interface NetworkPath {
  path: string[]
  contacts: Contact[]
  totalStrength: number
  steps: number
}

export interface NetworkInsights {
  totalContacts: number
  totalConnections: number
  networkDensity: number
  averageDegree: number
  hubs: Contact[]
  isolatedContacts: Contact[]
  strongestConnections: NetworkEdge[]
  suggestedConnections: Array<{ contact1: Contact; contact2: Contact; reason: string }>
}

export interface IntroductionPath {
  path: Contact[]
  introducers: Contact[]
  totalSteps: number
  strength: number
  notes: string[]
}

// Build network graph from contacts
export function buildNetworkGraph(contacts: Contact[]): { nodes: NetworkNode[]; edges: NetworkEdge[] } {
  const nodes: NetworkNode[] = contacts.map(contact => ({
    id: contact.id,
    contact,
    connections: (contact.connections || []).map(c => c.contactId),
    degree: (contact.connections || []).length,
    isHub: false
  }))

  const edges: NetworkEdge[] = []
  const edgeMap = new Map<string, NetworkEdge>()

  // Build edges from connections
  contacts.forEach(contact => {
    (contact.connections || []).forEach(connection => {
      const edgeKey = [contact.id, connection.contactId].sort().join('-')
      
      if (!edgeMap.has(edgeKey)) {
        const targetContact = contacts.find(c => c.id === connection.contactId)
        if (targetContact) {
          const edge: NetworkEdge = {
            source: contact.id,
            target: connection.contactId,
            strength: connection.strength,
            type: connection.type,
            bidirectional: false
          }
          edges.push(edge)
          edgeMap.set(edgeKey, edge)
        }
      }
    })
  })

  // Check for bidirectional connections
  edges.forEach(edge => {
    const reverseKey = [edge.target, edge.source].sort().join('-')
    if (edgeMap.has(reverseKey)) {
      edge.bidirectional = true
    }
  })

  // Identify hubs (contacts with high degree)
  const avgDegree = nodes.reduce((sum, node) => sum + node.degree, 0) / nodes.length
  nodes.forEach(node => {
    node.isHub = node.degree > avgDegree * 1.5
  })

  return { nodes, edges }
}

// Find shortest path between two contacts
export function findShortestPath(
  contacts: Contact[],
  sourceId: string,
  targetId: string
): NetworkPath | null {
  const { nodes, edges } = buildNetworkGraph(contacts)
  const adjacencyList = new Map<string, string[]>()
  
  // Build adjacency list
  nodes.forEach(node => {
    adjacencyList.set(node.id, node.connections)
  })

  // BFS to find shortest path
  const queue: Array<{ id: string; path: string[] }> = [{ id: sourceId, path: [sourceId] }]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const { id, path } = queue.shift()!
    
    if (id === targetId) {
      const contactsInPath = path.map(id => contacts.find(c => c.id === id)!).filter(Boolean)
      return {
        path,
        contacts: contactsInPath,
        totalStrength: calculatePathStrength(path, edges),
        steps: path.length - 1
      }
    }

    if (visited.has(id)) continue
    visited.add(id)

    const neighbors = adjacencyList.get(id) || []
    neighbors.forEach(neighborId => {
      if (!visited.has(neighborId)) {
        queue.push({ id: neighborId, path: [...path, neighborId] })
      }
    })
  }

  return null
}

// Find all paths between two contacts
export function findAllPaths(
  contacts: Contact[],
  sourceId: string,
  targetId: string,
  maxDepth: number = 3
): NetworkPath[] {
  const { nodes, edges } = buildNetworkGraph(contacts)
  const adjacencyList = new Map<string, string[]>()
  
  nodes.forEach(node => {
    adjacencyList.set(node.id, node.connections)
  })

  const paths: NetworkPath[] = []
  
  function dfs(currentId: string, targetId: string, path: string[], depth: number) {
    if (depth > maxDepth) return
    
    if (currentId === targetId && path.length > 1) {
      const contactsInPath = path.map(id => contacts.find(c => c.id === id)!).filter(Boolean)
      paths.push({
        path,
        contacts: contactsInPath,
        totalStrength: calculatePathStrength(path, edges),
        steps: path.length - 1
      })
      return
    }

    const neighbors = adjacencyList.get(currentId) || []
    neighbors.forEach(neighborId => {
      if (!path.includes(neighborId)) {
        dfs(neighborId, targetId, [...path, neighborId], depth + 1)
      }
    })
  }

  dfs(sourceId, targetId, [sourceId], 0)
  
  // Sort by strength and steps
  return paths.sort((a, b) => {
    if (a.steps !== b.steps) return a.steps - b.steps
    return b.totalStrength - a.totalStrength
  })
}

// Calculate path strength based on connection strengths
function calculatePathStrength(path: string[], edges: NetworkEdge[]): number {
  let totalStrength = 0
  for (let i = 0; i < path.length - 1; i++) {
    const edge = edges.find(e => 
      (e.source === path[i] && e.target === path[i + 1]) ||
      (e.source === path[i + 1] && e.target === path[i])
    )
    if (edge) {
      totalStrength += getStrengthValue(edge.strength)
    }
  }
  return totalStrength
}

// Convert strength to numeric value
function getStrengthValue(strength: ConnectionStrength): number {
  switch (strength) {
    case 'strong': return 3
    case 'medium': return 2
    case 'weak': return 1
    default: return 1
  }
}

// Generate network insights
export function generateNetworkInsights(contacts: Contact[]): NetworkInsights {
  const { nodes, edges } = buildNetworkGraph(contacts)
  
  const totalContacts = contacts.length
  const totalConnections = edges.length
  const maxPossibleConnections = (totalContacts * (totalContacts - 1)) / 2
  const networkDensity = maxPossibleConnections > 0 ? totalConnections / maxPossibleConnections : 0
  const averageDegree = nodes.reduce((sum, node) => sum + node.degree, 0) / nodes.length
  
  const hubs = nodes
    .filter(node => node.isHub)
    .map(node => node.contact)
    .sort((a, b) => (b.connections || []).length - (a.connections || []).length)
    .slice(0, 5)

  const isolatedContacts = contacts.filter(contact => (contact.connections || []).length === 0)

  const strongestConnections = edges
    .filter(edge => edge.strength === 'strong')
    .sort((a, b) => getStrengthValue(b.strength) - getStrengthValue(a.strength))
    .slice(0, 10)

  const suggestedConnections = generateSuggestedConnections(contacts, nodes)

  return {
    totalContacts,
    totalConnections,
    networkDensity,
    averageDegree,
    hubs,
    isolatedContacts,
    strongestConnections,
    suggestedConnections
  }
}

// Generate suggested connections based on common interests and locations
function generateSuggestedConnections(
  contacts: Contact[],
  nodes: NetworkNode[]
): Array<{ contact1: Contact; contact2: Contact; reason: string }> {
  const suggestions: Array<{ contact1: Contact; contact2: Contact; reason: string }> = []
  
  for (let i = 0; i < contacts.length; i++) {
    for (let j = i + 1; j < contacts.length; j++) {
      const contact1 = contacts[i]
      const contact2 = contacts[j]
      
      // Skip if already connected
      if ((contact1.connections || []).some(c => c.contactId === contact2.id)) continue
      
      let reason = ''
      
      // Check for common interests
      const commonInterests = (contact1.interests || []).filter(interest => 
        (contact2.interests || []).includes(interest)
      )
      if (commonInterests.length > 0) {
        reason = `Common interests: ${commonInterests.join(', ')}`
      }
      
      // Check for same location
      if (contact1.location && contact2.location && contact1.location === contact2.location) {
        reason = reason ? `${reason}; Same location: ${contact1.location}` : `Same location: ${contact1.location}`
      }
      
      // Check for same tier
      if (contact1.tier === contact2.tier) {
        reason = reason ? `${reason}; Same tier: ${contact1.tier}` : `Same tier: ${contact1.tier}`
      }
      
      if (reason) {
        suggestions.push({ contact1, contact2, reason })
      }
    }
  }
  
  return suggestions.slice(0, 10) // Limit to top 10 suggestions
}

// Generate introduction paths
export function generateIntroductionPaths(
  contacts: Contact[],
  sourceId: string,
  targetId: string
): IntroductionPath[] {
  const paths = findAllPaths(contacts, sourceId, targetId, 3)
  
  return paths.map(path => {
    const introducers = path.contacts.slice(1, -1) // Exclude source and target
    const notes = introducers.map((contact, index) => 
      `Step ${index + 1}: ${contact.name} (${contact.tier}) - ${contact.relationshipToGary}`
    )
    
    return {
      path: path.contacts,
      introducers,
      totalSteps: path.steps,
      strength: path.totalStrength,
      notes
    }
  })
}

// Get network statistics
export function getNetworkStatistics(contacts: Contact[]): {
  totalConnections: number
  averageConnectionsPerContact: number
  mostConnectedContact: Contact | null
  connectionStrengthDistribution: Record<ConnectionStrength, number>
} {
  const totalConnections = contacts.reduce((sum, contact) => sum + (contact.connections || []).length, 0)
  const averageConnectionsPerContact = contacts.length > 0 ? totalConnections / contacts.length : 0
  
  const mostConnectedContact = contacts.reduce((max, contact) => 
    (contact.connections || []).length > (max.connections || []).length ? contact : max
  , contacts[0] || null)
  
  const connectionStrengthDistribution: Record<ConnectionStrength, number> = {
    strong: 0,
    medium: 0,
    weak: 0
  }
  
  contacts.forEach(contact => {
    (contact.connections || []).forEach(connection => {
      connectionStrengthDistribution[connection.strength]++
    })
  })
  
  return {
    totalConnections,
    averageConnectionsPerContact,
    mostConnectedContact,
    connectionStrengthDistribution
  }
} 