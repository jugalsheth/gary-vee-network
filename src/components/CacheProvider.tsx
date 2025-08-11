'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { smartFetcher, getCacheStats } from '../lib/smartFetcher';
import { cacheUtils } from '../lib/cache';

// Cache context interface
interface CacheContextType {
  // Cache statistics
  cacheStats: {
    size: number;
    maxSize: number;
    hits: number;
    misses: number;
    hitRate: string;
    keys: string[];
  };
  
  // Cache actions
  invalidateCache: () => void;
  invalidateContacts: () => void;
  clearCache: () => void;
  
  // Smart fetching methods
  fetchContacts: typeof smartFetcher.fetchContacts;
  fetchAnalytics: typeof smartFetcher.fetchAnalytics;
  fetchNetworkStats: typeof smartFetcher.fetchNetworkStats;
  searchContacts: typeof smartFetcher.searchContacts;
  fetchAllContacts: typeof smartFetcher.fetchAllContacts;
  
  // Cache status
  isPreloading: boolean;
  preloadData: () => Promise<void>;
  
  // Performance metrics
  performanceMetrics: {
    totalRequests: number;
    cachedRequests: number;
    apiRequests: number;
    averageResponseTime: number;
  };
}

// Create context
const CacheContext = createContext<CacheContextType | undefined>(undefined);

// Performance tracking
class PerformanceTracker {
  private requests: Array<{ timestamp: number; cached: boolean; responseTime: number }> = [];
  private maxRequests = 100;

  recordRequest(cached: boolean, responseTime: number) {
    this.requests.push({
      timestamp: Date.now(),
      cached,
      responseTime,
    });

    // Keep only recent requests
    if (this.requests.length > this.maxRequests) {
      this.requests.shift();
    }
  }

  getMetrics() {
    const total = this.requests.length;
    const cached = this.requests.filter(r => r.cached).length;
    const api = total - cached;
    const avgResponseTime = this.requests.length > 0 
      ? this.requests.reduce((sum, r) => sum + r.responseTime, 0) / this.requests.length
      : 0;

    return {
      totalRequests: total,
      cachedRequests: cached,
      apiRequests: api,
      averageResponseTime: Math.round(avgResponseTime),
    };
  }

  clear() {
    this.requests = [];
  }
}

// Cache provider component
export function CacheProvider({ children }: { children: ReactNode }) {
  const [cacheStats, setCacheStats] = useState(getCacheStats());
  const [isPreloading, setIsPreloading] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalRequests: 0,
    cachedRequests: 0,
    apiRequests: 0,
    averageResponseTime: 0,
  });

  const performanceTracker = React.useRef(new PerformanceTracker());

  // Update cache stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(getCacheStats());
      setPerformanceMetrics(performanceTracker.current.getMetrics());
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Preload data on mount
  useEffect(() => {
    const preload = async () => {
      setIsPreloading(true);
      try {
        await smartFetcher.preloadData();
      } catch (error) {
        console.warn('Preloading failed:', error);
      } finally {
        setIsPreloading(false);
      }
    };

    preload();
  }, []);

  // Enhanced fetch methods with performance tracking
  const fetchContactsWithTracking = async (page: number = 1, limit: number = 30, filters: any = {}) => {
    const startTime = Date.now();
    
    try {
      const result = await smartFetcher.fetchContacts(page, limit, filters);
      const responseTime = Date.now() - startTime;
      
      // Check if it was cached by looking at console logs or cache state
      const wasCached = cacheStats.hits > 0; // This is a simplified check
      performanceTracker.current.recordRequest(wasCached, responseTime);
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      performanceTracker.current.recordRequest(false, responseTime);
      throw error;
    }
  };

  const fetchAnalyticsWithTracking = async () => {
    const startTime = Date.now();
    
    try {
      const result = await smartFetcher.fetchAnalytics();
      const responseTime = Date.now() - startTime;
      
      const wasCached = cacheStats.hits > 0;
      performanceTracker.current.recordRequest(wasCached, responseTime);
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      performanceTracker.current.recordRequest(false, responseTime);
      throw error;
    }
  };

  const fetchNetworkStatsWithTracking = async () => {
    const startTime = Date.now();
    
    try {
      const result = await smartFetcher.fetchNetworkStats();
      const responseTime = Date.now() - startTime;
      
      const wasCached = cacheStats.hits > 0;
      performanceTracker.current.recordRequest(wasCached, responseTime);
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      performanceTracker.current.recordRequest(false, responseTime);
      throw error;
    }
  };

  const searchContactsWithTracking = async (query: string, filters: any) => {
    const startTime = Date.now();
    
    try {
      const result = await smartFetcher.searchContacts(query, filters);
      const responseTime = Date.now() - startTime;
      
      const wasCached = cacheStats.hits > 0;
      performanceTracker.current.recordRequest(wasCached, responseTime);
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      performanceTracker.current.recordRequest(false, responseTime);
      throw error;
    }
  };

  const fetchAllContactsWithTracking = async () => {
    const startTime = Date.now();
    
    try {
      const result = await smartFetcher.fetchAllContacts();
      const responseTime = Date.now() - startTime;
      
      const wasCached = cacheStats.hits > 0;
      performanceTracker.current.recordRequest(wasCached, responseTime);
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      performanceTracker.current.recordRequest(false, responseTime);
      throw error;
    }
  };

  // Cache actions
  const invalidateCache = () => {
    smartFetcher.invalidateCache();
    performanceTracker.current.clear();
    setCacheStats(getCacheStats());
  };

  const invalidateContacts = () => {
    cacheUtils.invalidateContacts();
    setCacheStats(getCacheStats());
  };

  const clearCache = () => {
    cacheUtils.invalidateAll();
    performanceTracker.current.clear();
    setCacheStats(getCacheStats());
  };

  const preloadData = async () => {
    setIsPreloading(true);
    try {
      await smartFetcher.preloadData();
    } finally {
      setIsPreloading(false);
    }
  };

  const contextValue: CacheContextType = {
    cacheStats,
    invalidateCache,
    invalidateContacts,
    clearCache,
    fetchContacts: fetchContactsWithTracking,
    fetchAnalytics: fetchAnalyticsWithTracking,
    fetchNetworkStats: fetchNetworkStatsWithTracking,
    searchContacts: searchContactsWithTracking,
    fetchAllContacts: fetchAllContactsWithTracking,
    isPreloading,
    preloadData,
    performanceMetrics,
  };

  return (
    <CacheContext.Provider value={contextValue}>
      {children}
    </CacheContext.Provider>
  );
}

// Hook to use cache context
export function useCache() {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
}

// Hook for cache statistics
export function useCacheStats() {
  const { cacheStats } = useCache();
  return cacheStats;
}

// Hook for performance metrics
export function usePerformanceMetrics() {
  const { performanceMetrics } = useCache();
  return performanceMetrics;
} 