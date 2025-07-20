// LocalStorage utilities for Contact CRUD operations
import type { Contact } from './types'
import { safeDateConversion } from './utils'

const STORAGE_KEY = 'contacts'

export function getContacts(): Contact[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    
    const contacts = JSON.parse(data) as Contact[]
    
    // Convert string dates back to Date objects for consistency and ensure new fields exist
    return contacts.map(contact => ({
      ...contact,
      connections: contact.connections || [],
      interests: contact.interests || [],
      notes: contact.notes || '',
      socialHandles: contact.socialHandles || {},
      createdAt: safeDateConversion(contact.createdAt),
      updatedAt: safeDateConversion(contact.updatedAt)
    }))
  } catch (error) {
    console.error('Failed to load contacts from localStorage', error)
    return []
  }
}

export function saveContacts(contacts: Contact[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
  } catch (error) {
    console.error('Failed to save contacts to localStorage', error)
  }
}

export function addContact(contact: Contact): void {
  const contacts = getContacts()
  contacts.push(contact)
  saveContacts(contacts)
}

export function updateContact(updated: Contact): void {
  const contacts = getContacts().map(c => c.id === updated.id ? updated : c)
  saveContacts(contacts)
}

export function deleteContact(id: string): void {
  const contacts = getContacts().filter(c => c.id !== id)
  saveContacts(contacts)
} 