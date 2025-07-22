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

// Haptic utility functions
export class HapticFeedback {
  // Check if haptics are supported
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'vibrate' in navigator;
  }

  // Light haptic (10ms) - for hover, focus
  static light(): void {
    if (this.isSupported()) {
      navigator.vibrate(10);
    }
  }

  // Medium haptic (25ms) - for clicks, selections
  static medium(): void {
    if (this.isSupported()) {
      navigator.vibrate(25);
    }
  }

  // Strong haptic (50ms) - for success, important actions
  static strong(): void {
    if (this.isSupported()) {
      navigator.vibrate(50);
    }
  }

  // Success pattern (short-long-short)
  static success(): void {
    if (this.isSupported()) {
      navigator.vibrate([20, 10, 40, 10, 20]);
    }
  }

  // Error pattern (double pulse)
  static error(): void {
    if (this.isSupported()) {
      navigator.vibrate([30, 100, 30]);
    }
  }

  // Notification pattern (gentle)
  static notification(): void {
    if (this.isSupported()) {
      navigator.vibrate([15, 50, 15]);
    }
  }
}

// --- GLOBAL ANALYTICS ---
import type { Contact, GlobalAnalytics, GlobalFilters } from './types';

export function calculateGlobalAnalytics(allContacts: Contact[]): GlobalAnalytics {
  // Example implementation, expand as needed
  const byLocation: Record<string, number> = {};
  const byTeam: Record<string, number> = {};
  let recentlyAdded = 0;
  const now = new Date();
  allContacts.forEach(c => {
    if (c.city) byLocation[c.city] = (byLocation[c.city] || 0) + 1;
    if (c.team) byTeam[c.team] = (byTeam[c.team] || 0) + 1;
    if ((now.getTime() - new Date(c.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000) recentlyAdded++;
  });
  return {
    totalContacts: allContacts.length,
    tier1Count: allContacts.filter(c => c.tier === 'tier1').length,
    tier2Count: allContacts.filter(c => c.tier === 'tier2').length,
    tier3Count: allContacts.filter(c => c.tier === 'tier3').length,
    recentlyAdded,
    byLocation,
    byTeam,
    activityMetrics: { lastContacted: undefined, contactFrequency: undefined }
  };
}

// --- GLOBAL FILTERS ---
export function applyGlobalFilters(allContacts: Contact[], filters: GlobalFilters): Contact[] {
  let filtered = [...allContacts];
  if (filters.selectedTiers.length > 0) {
    filtered = filtered.filter(c => filters.selectedTiers.includes(c.tier));
  }
  if (filters.selectedTeams.length > 0) {
    filtered = filtered.filter(c => c.team && filters.selectedTeams.includes(c.team));
  }
  if (filters.locations.length > 0) {
    filtered = filtered.filter(c =>
      filters.locations.some(loc =>
        (c.city && c.city.includes(loc)) ||
        (c.state && c.state.includes(loc)) ||
        (c.country && c.country.includes(loc))
      )
    );
  }
  if (filters.dateRange) {
    const { start, end } = filters.dateRange;
    filtered = filtered.filter(c =>
      c.createdAt >= start &&
      c.createdAt <= end
    );
  }
  if (filters.hasKids !== null) {
    filtered = filtered.filter(c => c.hasKids === filters.hasKids);
  }
  if (filters.isMarried !== null) {
    filtered = filtered.filter(c => c.isMarried === filters.isMarried);
  }
  return filtered;
}

// --- PAGINATION ---
export function paginateResults(filteredContacts: Contact[], currentPage: number, itemsPerPage: number = 30) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredContacts.slice(startIndex, endIndex);
}

// --- DEBOUNCE ---
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// --- GLOBAL SEARCH (placeholder) ---
// import Fuse from 'fuse.js';
// export function performGlobalSearch(query: string, allContacts: Contact[]): Contact[] {
//   // Implement Fuse.js search here
//   return [];
// }
