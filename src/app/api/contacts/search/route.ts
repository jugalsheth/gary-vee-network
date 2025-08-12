import { optimizedSearch, searchMetrics } from '@/lib/optimized-search';
import { NextRequest } from 'next/server';
import { searchLimiter } from '@/lib/rateLimit';
import { errorMonitor, extractRequestContext } from '@/lib/errorMonitor';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // Apply rate limiting
  try {
    await new Promise((resolve, reject) => {
      searchLimiter(request as any, {
        status: (code: number) => ({ json: (data: any) => reject(new Error(JSON.stringify(data))) }),
        json: (data: any) => reject(new Error(JSON.stringify(data)))
      } as any, resolve);
    });
  } catch (error) {
    const errorData = JSON.parse(error.message);
    return new Response(JSON.stringify(errorData), { 
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    
    if (!query.trim()) {
      return new Response(JSON.stringify({ 
        contacts: [], 
        pagination: { currentPage: page, itemsPerPage: limit, totalItems: 0, totalPages: 1 } 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Use optimized search with caching
    const { contacts, pagination } = await optimizedSearch(query, page, limit);
    
    // Record metrics
    const responseTime = Date.now() - startTime;
    const cacheHit = responseTime < 50; // Rough estimate of cache hit
    searchMetrics.recordSearch(responseTime, cacheHit);
    
    return new Response(JSON.stringify({ 
      contacts, 
      pagination,
      metrics: {
        responseTime,
        cacheHit,
        searchStats: searchMetrics.getStats()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Search API error:', error);
    
    // Log error with context
    const context = extractRequestContext(request);
    errorMonitor.logError(error, {
      ...context,
      additionalData: {
        query: searchParams.get('query'),
        page: searchParams.get('page'),
        limit: searchParams.get('limit')
      }
    });
    
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 