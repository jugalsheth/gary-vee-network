import { Contact, GlobalFilters } from './types';

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Cache invalidation patterns
export type CacheKey = 
  | 'contacts'
  | 'contacts-analytics'
  | 'contacts-network-stats'
  | 'contacts-search'
  | 'contacts-filters';

// Cache configuration
const CACHE_CONFIG = {
  contacts: { ttl: 5 * 60 * 1000 }, // 5 minutes
  'contacts-analytics': { ttl: 2 * 60 * 1000 }, // 2 minutes
  'contacts-network-stats': { ttl: 10 * 60 * 1000 }, // 10 minutes
  'contacts-search': { ttl: 1 * 60 * 1000 }, // 1 minute
  'contacts-filters': { ttl: 30 * 60 * 1000 }, // 30 minutes
} as const;

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private cacheHits = 0;
  private cacheMisses = 0;
  private cacheSize = 0;
  private maxCacheSize = 100; // Maximum number of cache entries

  // Get cached data
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.cacheMisses++;
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.cacheSize--;
      this.cacheMisses++;
      return null;
    }

    this.cacheHits++;
    return entry.data;
  }

  // Set cached data
  set<T>(key: string, data: T, ttl?: number): void {
    // Check cache size limit
    if (this.cacheSize >= this.maxCacheSize) {
      this.evictOldest();
    }

    const defaultTtl = CACHE_CONFIG[key as CacheKey]?.ttl || 5 * 60 * 1000;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || defaultTtl,
    };

    this.cache.set(key, entry);
    this.cacheSize++;
  }

  // Check if data exists and is valid
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.cacheSize--;
      return false;
    }
    
    return true;
  }

  // Invalidate specific cache entry
  invalidate(key: string): void {
    if (this.cache.delete(key)) {
      this.cacheSize--;
    }
  }

  // Invalidate multiple cache entries by pattern
  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        this.cacheSize--;
      }
    }
  }

  // Invalidate all cache entries
  clear(): void {
    this.cache.clear();
    this.cacheSize = 0;
  }

  // Get cache statistics
  getStats() {
    const hitRate = this.cacheHits + this.cacheMisses > 0 
      ? (this.cacheHits / (this.cacheHits + this.cacheMisses) * 100).toFixed(2)
      : '0.00';
    
    return {
      size: this.cacheSize,
      maxSize: this.maxCacheSize,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: `${hitRate}%`,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Evict oldest cache entries when limit is reached
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.cacheSize--;
    }
  }

  // Generate cache key with parameters
  static generateKey(baseKey: CacheKey, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return baseKey;
    }
    
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    
    return `${baseKey}:${sortedParams}`;
  }
}

// Create singleton instance
export const memoryCache = new MemoryCache();

// Cache utilities for common operations
export const cacheUtils = {
  // Cache contacts with pagination
  cacheContacts: (page: number, limit: number, filters: any, data: any) => {
    const key = MemoryCache.generateKey('contacts', { page, limit, filters });
    memoryCache.set(key, data);
  },

  // Cache analytics data
  cacheAnalytics: (data: any) => {
    memoryCache.set('contacts-analytics', data);
  },

  // Cache network stats
  cacheNetworkStats: (data: any) => {
    memoryCache.set('contacts-network-stats', data);
  },

  // Cache search results
  cacheSearchResults: (query: string, filters: GlobalFilters, data: any) => {
    const key = MemoryCache.generateKey('contacts-search', { query, filters });
    memoryCache.set(key, data);
  },

  // Invalidate contacts cache when data changes
  invalidateContacts: () => {
    memoryCache.invalidatePattern('contacts');
  },

  // Invalidate all caches (use when data is updated)
  invalidateAll: () => {
    memoryCache.clear();
  },

  // Get cached contacts
  getCachedContacts: (page: number, limit: number, filters: any) => {
    const key = MemoryCache.generateKey('contacts', { page, limit, filters });
    return memoryCache.get(key);
  },

  // Get cached analytics
  getCachedAnalytics: () => {
    return memoryCache.get('contacts-analytics');
  },

  // Get cached network stats
  getCachedNetworkStats: () => {
    return memoryCache.get('contacts-network-stats');
  },

  // Get cached search results
  getCachedSearchResults: (query: string, filters: GlobalFilters) => {
    const key = MemoryCache.generateKey('contacts-search', { query, filters });
    return memoryCache.get(key);
  },
};

// Export the cache instance and utilities
export default memoryCache; 