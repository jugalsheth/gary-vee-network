import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export type Team = 'CAIT' | 'TeamG'
export type Role = 'admin' | 'editor' | 'viewer'

export interface Permission {
  resource: 'contacts' | 'ai_chat' | 'export' | 'admin'
  actions: readonly ('read' | 'write' | 'delete')[]
  fieldRestrictions?: {
    tier1?: string[]
    tier2?: string[]
    tier3?: string[]
  }
}

export interface User {
  id: string
  username: string
  email: string
  team: Team
  role: Role
  permissions: Permission[]
  createdAt: Date
  lastLogin: Date
}

export interface AuthUser {
  id: string
  username: string
  email: string
  team: Team
  role: Role
  permissions: Permission[]
}

export interface LoginCredentials {
  username: string
  password: string
  team: Team
}

// Demo users with hashed passwords
export const demoUsers = [
  {
    id: '1',
    username: 'demo-cait',
    email: 'cait@garyvee.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
    team: 'CAIT' as Team,
    role: 'editor' as Role,
    permissions: [
      {
        resource: 'contacts' as const,
        actions: ['read', 'write'] as const,
        fieldRestrictions: {
          tier1: ['phone'] // CAIT can't see Tier 1 phone numbers
        }
      },
      {
        resource: 'ai_chat' as const,
        actions: ['read'] as const
      },
      {
        resource: 'export' as const,
        actions: ['read'] as const
      }
    ],
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: '2',
    username: 'demo-teamg',
    email: 'teamg@garyvee.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
    team: 'TeamG' as Team,
    role: 'admin' as Role,
    permissions: [
      {
        resource: 'contacts' as const,
        actions: ['read', 'write', 'delete'] as const
      },
      {
        resource: 'ai_chat' as const,
        actions: ['read', 'write'] as const
      },
      {
        resource: 'export' as const,
        actions: ['read', 'write'] as const
      },
      {
        resource: 'admin' as const,
        actions: ['read', 'write'] as const
      }
    ],
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  }
]

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'gary-vee-network-secret-key'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      team: user.team,
      role: user.role,
      permissions: user.permissions
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}

export function hasPermission(
  user: AuthUser | null,
  resource: string,
  action: string,
  field?: string,
  tier?: string
): boolean {
  if (!user) return false

  const permission = user.permissions.find(p => p.resource === resource)
  if (!permission) return false

  // Check if user has the required action
  if (!permission.actions.includes(action as any)) {
    return false
  }

  // Check field restrictions if field and tier are provided
  if (field && tier && permission.fieldRestrictions) {
    const restrictedFields = permission.fieldRestrictions[tier as keyof typeof permission.fieldRestrictions]
    if (restrictedFields && restrictedFields.includes(field)) {
      return false
    }
  }

  return true
}

export function canSeeField(user: AuthUser | null, field: string, tier: string): boolean {
  return hasPermission(user, 'contacts', 'read', field, tier)
}

export function canEditContact(user: AuthUser | null, tier: string): boolean {
  return hasPermission(user, 'contacts', 'write') && 
         hasPermission(user, 'contacts', 'read', undefined, tier)
}

export function canDeleteContact(user: AuthUser | null): boolean {
  return hasPermission(user, 'contacts', 'delete')
}

export function canUseAIChat(user: AuthUser | null): boolean {
  return hasPermission(user, 'ai_chat', 'read')
}

export function canExportData(user: AuthUser | null): boolean {
  return hasPermission(user, 'export', 'read')
}

export function isAdmin(user: AuthUser | null): boolean {
  return hasPermission(user, 'admin', 'read')
}

export function getTeamColor(team: Team): string {
  switch (team) {
    case 'CAIT':
      return 'bg-blue-500 text-white'
    case 'TeamG':
      return 'bg-green-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

export function getTeamDisplayName(team: Team): string {
  switch (team) {
    case 'CAIT':
      return 'CAIT Team'
    case 'TeamG':
      return 'TeamG (Admin)'
    default:
      return team
  }
}

// Session storage utilities
export function saveSession(token: string, user: AuthUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(user))
  }
}

export function getSession(): { token: string | null; user: AuthUser | null } {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')
    const user = userStr ? JSON.parse(userStr) : null
    return { token, user }
  }
  return { token: null, user: null }
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }
}

export function isAuthenticated(): boolean {
  const { token, user } = getSession()
  if (!token || !user) return false
  
  // Verify token is still valid
  const verifiedUser = verifyToken(token)
  return verifiedUser !== null
} 