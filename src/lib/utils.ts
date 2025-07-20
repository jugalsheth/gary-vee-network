import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to safely handle dates that might be strings from localStorage
export function safeDateConversion(dateValue: Date | string | undefined): Date {
  if (!dateValue) {
    return new Date()
  }
  
  if (typeof dateValue === 'string') {
    return new Date(dateValue)
  }
  
  if (dateValue instanceof Date) {
    return dateValue
  }
  
  return new Date()
}

// Utility function to format date for CSV export
export function formatDateForCSV(dateValue: Date | string | undefined): string {
  const date = safeDateConversion(dateValue)
  return date.toISOString().split('T')[0]
}
