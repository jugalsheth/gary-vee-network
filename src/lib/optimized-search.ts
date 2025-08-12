import { searchContactsPaginated } from './storage';
import type { Contact } from './types';

// Simple in-memory cache for development
// In production, this should be replaced with Redis
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 500; // Maximum cache size

  set(key: string, data: any, ttl: number = 300000) {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️ Evicted oldest cache entry: ${oldestKey}`);
    }
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Global cache instance
const searchCache = new SimpleCache();

// Debounce function to prevent excessive API calls
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Hash function for cache keys
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

// Optimized search with caching
export async function optimizedSearch(
  query: string,
  page: number = 1,
  limit: number = 50
): Promise<{ contacts: Contact[]; pagination: any }> {
  const startTime = Date.now();
  
  // Skip cache for very short queries (less than 2 characters)
  if (query.trim().length < 2) {
    console.log('🔍 Skipping cache for short query:', query);
    const result = await searchContactsPaginated(query, page, limit);
    console.log(`⏱️ Search completed in ${Date.now() - startTime}ms`);
    return result;
  }

  // Create cache key
  const cacheKey = `search:${hashString(query)}:${page}:${limit}`;
  
  // Check cache first
  const cached = searchCache.get(cacheKey);
  if (cached) {
    console.log(`⚡ Cache hit for query: "${query}" (${Date.now() - startTime}ms)`);
    return cached;
  }

  // Perform search
  console.log(`🔍 Performing search for: "${query}"`);
  const result = await searchContactsPaginated(query, page, limit);
  
                // Cache results (15 minutes TTL for better hit rate)
              searchCache.set(cacheKey, result, 900000);
  
  console.log(`⏱️ Search completed in ${Date.now() - startTime}ms (cached for 5min)`);
  return result;
}

// Debounced search function for UI
export const debouncedSearch = debounce(
  async (
    query: string,
    page: number,
    limit: number,
    onResult: (result: { contacts: Contact[]; pagination: any }) => void,
    onError: (error: Error) => void
  ) => {
    try {
      const result = await optimizedSearch(query, page, limit);
      onResult(result);
    } catch (error) {
      onError(error as Error);
    }
  },
  300 // 300ms debounce
);

// Cache management functions
export function clearSearchCache() {
  searchCache.clear();
  console.log('🗑️ Search cache cleared');
}

// Cache warming - pre-populate with common searches
export async function warmSearchCache() {
  const commonQueries = [
    'tier1', 'tier2', 'tier3',
    'business', 'friend', 'mentor',
    'new york', 'california', 'london',
    'married', 'kids', 'entrepreneur'
  ];
  
  console.log('🔥 Warming search cache with common queries...');
  
  for (const query of commonQueries) {
    try {
      await optimizedSearch(query, 1, 50);
      console.log(`✅ Cached: "${query}"`);
    } catch (error) {
      console.log(`❌ Failed to cache: "${query}"`);
    }
  }
  
  console.log('🔥 Cache warming completed');
}

export function getCacheStats() {
  return {
    size: searchCache.size(),
    timestamp: Date.now()
  };
}

// Performance monitoring
export const searchMetrics = {
  totalSearches: 0,
  cacheHits: 0,
  cacheMisses: 0,
  averageResponseTime: 0,
  
  recordSearch(responseTime: number, cacheHit: boolean) {
    this.totalSearches++;
    if (cacheHit) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }
    
    // Update average response time
    this.averageResponseTime = 
      (this.averageResponseTime * (this.totalSearches - 1) + responseTime) / this.totalSearches;
  },
  
  getStats() {
    const cacheHitRate = this.totalSearches > 0 
      ? (this.cacheHits / this.totalSearches) * 100 
      : 0;
    
    return {
      totalSearches: this.totalSearches,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      cacheHitRate: `${cacheHitRate.toFixed(1)}%`,
      averageResponseTime: `${this.averageResponseTime.toFixed(0)}ms`,
      cacheSize: searchCache.size()
    };
  },
  
  reset() {
    this.totalSearches = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.averageResponseTime = 0;
  }
};
