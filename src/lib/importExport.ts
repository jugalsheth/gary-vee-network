import Papa from 'papaparse'
import type { Contact, Tier } from './types'
import { formatDateForCSV } from './utils'

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: ImportError[]
  duplicates: DuplicateContact[]
}

export interface ImportError {
  row: number
  field: string
  message: string
  value?: string
}

export interface DuplicateContact {
  row: number
  existingContact: Contact
  newContact: Partial<Contact>
  conflictType: 'email' | 'name'
}

export interface FieldMapping {
  name: string
  email: string
  phone: string
  tier: string
  relationshipToGary: string
  hasKids: string
  isMarried: string
  location: string
  interests: string
  notes: string
}

// Export contacts to CSV
export function exportContactsToCSV(contacts: Contact[]): void {
  const csvData = contacts.map(contact => ({
    name: contact.name,
    email: contact.email || '',
    phone: contact.phone || '',
    tier: contact.tier,
    relationshipToGary: contact.relationshipToGary,
    hasKids: contact.hasKids ? 'Yes' : 'No',
    isMarried: contact.isMarried ? 'Yes' : 'No',
    location: contact.location || '',
    interests: (contact.interests || []).join('; '),
    notes: contact.notes,
    createdAt: formatDateForCSV(contact.createdAt),
    updatedAt: formatDateForCSV(contact.updatedAt),
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  const date = new Date().toISOString().split('T')[0]
  const filename = `gary-vee-contacts-${date}.csv`
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Parse CSV file
export function parseCSVFile(file: File): Promise<{ data: Record<string, string>[], headers: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`))
        } else {
          resolve({
            data: results.data as Record<string, string>[],
            headers: results.meta.fields || []
          })
        }
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}

// Validate contact data
export function validateContactData(data: Record<string, string>, row: number): ImportError[] {
  const errors: ImportError[] = []

  // Preprocess boolean fields
  const hasKidsVal = parseBoolean(data.hasKids)
  const isMarriedVal = parseBoolean(data.isMarried)

  // Required fields
  if (!data.name || data.name.trim() === '') {
    errors.push({ row, field: 'name', message: 'Name is required', value: data.name })
  }

  if (!data.tier || !['tier1', 'tier2', 'tier3'].includes(data.tier)) {
    errors.push({ row, field: 'tier', message: 'Tier must be tier1, tier2, or tier3', value: data.tier })
  }

  if (!data.relationshipToGary || data.relationshipToGary.trim() === '') {
    errors.push({ row, field: 'relationshipToGary', message: 'Relationship to Gary is required', value: data.relationshipToGary })
  }

  // Email validation
  if (data.email && data.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      errors.push({ row, field: 'email', message: 'Invalid email format', value: data.email })
    }
  }

  // Boolean field validation (accepts Yes/No, true/false, 1/0, y/n)
  if (data.hasKids !== undefined && typeof hasKidsVal !== 'boolean') {
    errors.push({ row, field: 'hasKids', message: 'Has Kids must be Yes/No, true/false, 1/0, or y/n', value: data.hasKids })
  }

  if (data.isMarried !== undefined && typeof isMarriedVal !== 'boolean') {
    errors.push({ row, field: 'isMarried', message: 'Is Married must be Yes/No, true/false, 1/0, or y/n', value: data.isMarried })
  }

  return errors
}

// Convert CSV data to Contact objects
export function convertCSVToContacts(data: Record<string, string>[], fieldMapping: FieldMapping): Partial<Contact>[] {
  return data.map(row => {
    const contact: Partial<Contact> = {
      name: row[fieldMapping.name]?.trim() || '',
      email: row[fieldMapping.email]?.trim() || undefined,
      phone: row[fieldMapping.phone]?.trim() || undefined,
      tier: row[fieldMapping.tier] as Tier,
      relationshipToGary: row[fieldMapping.relationshipToGary]?.trim() || '',
      hasKids: parseBoolean(row[fieldMapping.hasKids]),
      isMarried: parseBoolean(row[fieldMapping.isMarried]),
      location: row[fieldMapping.location]?.trim() || undefined,
      interests: parseInterests(row[fieldMapping.interests]),
      notes: row[fieldMapping.notes]?.trim() || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    return contact
  })
}

// Parse boolean values from various formats
function parseBoolean(value: string | undefined): boolean {
  if (!value) return false
  const str = String(value).toLowerCase().trim()
  return ['yes', 'true', '1', 'y'].includes(str)
}

// Parse interests from semicolon-separated string
function parseInterests(value: string | undefined): string[] {
  if (!value) return []
  const str = String(value).trim()
  return str.split(';').map(interest => interest.trim()).filter(Boolean)
}

// Detect duplicates
export function detectDuplicates(
  newContacts: Partial<Contact>[], 
  existingContacts: Contact[]
): DuplicateContact[] {
  const duplicates: DuplicateContact[] = []

  newContacts.forEach((newContact, index) => {
    // Check by email
    if (newContact.email) {
      const existingByEmail = existingContacts.find(c => c.email === newContact.email)
      if (existingByEmail) {
        duplicates.push({
          row: index + 1,
          existingContact: existingByEmail,
          newContact,
          conflictType: 'email'
        })
        return
      }
    }

    // Check by name
    const existingByName = existingContacts.find(c => 
      c.name.toLowerCase() === newContact.name?.toLowerCase()
    )
    if (existingByName) {
      duplicates.push({
        row: index + 1,
        existingContact: existingByName,
        newContact,
        conflictType: 'name'
      })
    }
  })

  return duplicates
}

// Auto-detect field mapping
export function autoDetectFieldMapping(headers: string[]): FieldMapping {
  const mapping: FieldMapping = {
    name: '',
    email: '',
    phone: '',
    tier: '',
    relationshipToGary: '',
    hasKids: '',
    isMarried: '',
    location: '',
    interests: '',
    notes: ''
  }

  headers.forEach(header => {
    const lowerHeader = header.toLowerCase()
    
    if (lowerHeader.includes('name')) mapping.name = header
    else if (lowerHeader.includes('email')) mapping.email = header
    else if (lowerHeader.includes('phone')) mapping.phone = header
    else if (lowerHeader.includes('tier')) mapping.tier = header
    else if (lowerHeader.includes('relationship')) mapping.relationshipToGary = header
    else if (lowerHeader.includes('kids')) mapping.hasKids = header
    else if (lowerHeader.includes('married')) mapping.isMarried = header
    else if (lowerHeader.includes('location')) mapping.location = header
    else if (lowerHeader.includes('interest')) mapping.interests = header
    else if (lowerHeader.includes('note')) mapping.notes = header
  })

  return mapping
} 

// --- GLOBAL CONTACT LOADING ---
// import type { Contact } from './types'; // Already imported at top if present

export async function loadAllContacts(): Promise<Contact[]> {
  // Replace with actual API call or data source
  // Example: fetch('/api/contacts').then(res => res.json())
  return [];
} 