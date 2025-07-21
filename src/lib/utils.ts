import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a unique ID that combines timestamp with random numbers
export function generateUniqueId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${random}`
}

// Safe date conversion utility
export function safeDateConversion(date: Date | string | undefined): Date {
  if (!date) {
    return new Date()
  }
  if (date instanceof Date) {
    return date
  }
  if (typeof date === 'string') {
    const parsed = new Date(date)
    return isNaN(parsed.getTime()) ? new Date() : parsed
  }
  return new Date()
}

// Utility function to format date for CSV export
export function formatDateForCSV(dateValue: Date | string | undefined): string {
  const date = safeDateConversion(dateValue)
  return date.toISOString().split('T')[0]
}
