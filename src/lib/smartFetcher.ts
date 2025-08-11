import { cacheUtils, memoryCache } from './cache';
import { Contact, GlobalFilters } from './types';

// API response types
interface ContactsResponse {
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
}

interface AnalyticsResponse {
  total: number;
  tierCounts: { tier: string; count: number }[];
}

interface NetworkStatsResponse {
  contacts: Array<{
    id: string;
    name: string;
    tier: string;
    connections: number;
  }>;
}

// Smart fetcher class
class SmartFetcher {
  private baseUrl = '/api';
  private pendingRequests = new Map<string, Promise<any>>();

  // Fetch contacts with smart caching
  async fetchContacts(
    page: number = 1, 
    limit: number = 30, 
    filters: any = {}
  ): Promise<ContactsResponse> {
    const cacheKey = `contacts:${page}:${limit}:${JSON.stringify(filters)}`;
    
    // Check cache first
    const cached = cacheUtils.getCachedContacts(page, limit, filters);
    if (cached) {
      console.log('🚀 Cache HIT: Using cached contacts data');
      return cached;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      console.log('⏳ Request already pending, waiting...');
      return this.pendingRequests.get(cacheKey)!;
    }

    // Make API call
    console.log('📡 Cache MISS: Fetching contacts from API');
    const request = this.makeRequest<ContactsResponse>(
      `${this.baseUrl}/contacts?page=${page}&limit=${limit}`,
      { method: 'GET' }
    );

    this.pendingRequests.set(cacheKey, request);

    try {
      const data = await request;
      
      // Cache the response
      cacheUtils.cacheContacts(page, limit, filters, data);
      
      return data;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  // Fetch analytics with smart caching
  async fetchAnalytics(): Promise<AnalyticsResponse> {
    // Check cache first
    const cached = cacheUtils.getCachedAnalytics();
    if (cached) {
      console.log('🚀 Cache HIT: Using cached analytics data');
      return cached;
    }

    // Check if request is already pending
    if (this.pendingRequests.has('analytics')) {
      console.log('⏳ Analytics request already pending, waiting...');
      return this.pendingRequests.get('analytics')!;
    }

    // Make API call
    console.log('📡 Cache MISS: Fetching analytics from API');
    const request = this.makeRequest<AnalyticsResponse>(
      `${this.baseUrl}/contacts/analytics`,
      { method: 'GET' }
    );

    this.pendingRequests.set('analytics', request);

    try {
      const data = await request;
      
      // Cache the response
      cacheUtils.cacheAnalytics(data);
      
      return data;
    } finally {
      this.pendingRequests.delete('analytics');
    }
  }

  // Fetch network stats with smart caching
  async fetchNetworkStats(): Promise<NetworkStatsResponse> {
    // Check cache first
    const cached = cacheUtils.getCachedNetworkStats();
    if (cached) {
      console.log('🚀 Cache HIT: Using cached network stats');
      return cached;
    }

    // Check if request is already pending
    if (this.pendingRequests.has('network-stats')) {
      console.log('⏳ Network stats request already pending, waiting...');
      return this.pendingRequests.get('network-stats')!;
    }

    // Make API call
    console.log('📡 Cache MISS: Fetching network stats from API');
    const request = this.makeRequest<NetworkStatsResponse>(
      `${this.baseUrl}/contacts/network-stats`,
      { method: 'GET' }
    );

    this.pendingRequests.set('network-stats', request);

    try {
      const data = await request;
      
      // Cache the response
      cacheUtils.cacheNetworkStats(data);
      
      return data;
    } finally {
      this.pendingRequests.delete('network-stats');
    }
  }

  // Search contacts with smart caching
  async searchContacts(
    query: string, 
    filters: GlobalFilters
  ): Promise<Contact[]> {
    // Check cache first
    const cached = cacheUtils.getCachedSearchResults(query, filters);
    if (cached) {
      console.log('🚀 Cache HIT: Using cached search results');
      return cached;
    }

    const cacheKey = `search:${query}:${JSON.stringify(filters)}`;
    
    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      console.log('⏳ Search request already pending, waiting...');
      return this.pendingRequests.get(cacheKey)!;
    }

    // Make API call
    console.log('📡 Cache MISS: Searching contacts from API');
    const request = this.makeRequest<Contact[]>(
      `${this.baseUrl}/contacts/search`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filters }),
      }
    );

    this.pendingRequests.set(cacheKey, request);

    try {
      const data = await request;
      
      // Cache the response
      cacheUtils.cacheSearchResults(query, filters, data);
      
      return data;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  // Fetch all contacts for global filtering (with caching)
  async fetchAllContacts(): Promise<Contact[]> {
    const cacheKey = 'all-contacts';
    
    // Check cache first
    const cached = memoryCache.get<Contact[]>(cacheKey);
    if (cached) {
      console.log('🚀 Cache HIT: Using cached all contacts data');
      return cached;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      console.log('⏳ All contacts request already pending, waiting...');
      return this.pendingRequests.get(cacheKey)!;
    }

    // Make API call to get all contacts
    console.log('📡 Cache MISS: Fetching all contacts from API');
    const request = this.makeRequest<Contact[]>(
      `${this.baseUrl}/contacts?limit=10000`, // Large limit to get all
      { method: 'GET' }
    );

    this.pendingRequests.set(cacheKey, request);

    try {
      const data = await request;
      
      // Cache the response with longer TTL since this is expensive
      memoryCache.set(cacheKey, data, 15 * 60 * 1000); // 15 minutes
      
      return data;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  // Generic request method with error handling
  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 500) {
          console.warn('⚠️ Server error (500) - likely missing environment variables');
          // Return empty data instead of throwing
          return this.getEmptyResponse<T>(url);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ API request failed:', error);
      
      // Return empty response instead of throwing for better UX
      console.log('🔄 Returning empty response due to API failure');
      return this.getEmptyResponse<T>(url);
    }
  }

  // Get empty response based on endpoint
  private getEmptyResponse<T>(url: string): T {
    if (url.includes('/contacts')) {
      return {
        contacts: [],
        total: 0,
        page: 1,
        limit: 30,
      } as T;
    }
    
    if (url.includes('/analytics')) {
      return {
        total: 0,
        tierCounts: [],
      } as T;
    }
    
    if (url.includes('/network-stats')) {
      return {
        contacts: [],
      } as T;
    }
    
    return [] as T;
  }

  // Invalidate cache when data changes
  invalidateCache(): void {
    console.log('🗑️ Invalidating all caches due to data change');
    cacheUtils.invalidateAll();
  }

  // Get cache statistics
  getCacheStats() {
    return memoryCache.getStats();
  }

  // Preload common data
  async preloadData(): Promise<void> {
    console.log('🚀 Preloading common data for better performance...');
    
    try {
      // Preload first page of contacts and analytics
      await Promise.all([
        this.fetchContacts(1, 30),
        this.fetchAnalytics(),
      ]);
      
      console.log('✅ Data preloaded successfully');
    } catch (error) {
      console.warn('⚠️ Preloading failed, continuing without cache:', error);
    }
  }
}

// Create singleton instance
export const smartFetcher = new SmartFetcher();

// Export the class for testing
export { SmartFetcher };

// Export utility functions
export const {
  fetchContacts,
  fetchAnalytics,
  fetchNetworkStats,
  searchContacts,
  fetchAllContacts,
  invalidateCache,
  getCacheStats,
  preloadData,
} = smartFetcher; 