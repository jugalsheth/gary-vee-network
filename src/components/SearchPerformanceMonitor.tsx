'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, Clock, TrendingUp, Database } from 'lucide-react';

interface SearchMetrics {
  totalSearches: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: string;
  averageResponseTime: string;
  cacheSize: number;
}

export function SearchPerformanceMonitor() {
  const [metrics, setMetrics] = useState<SearchMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Make a test search to get metrics
      const response = await fetch('/api/contacts/search?query=test&page=1&limit=1');
      if (response.ok) {
        const data = await response.json();
        if (data.metrics?.searchStats) {
          setMetrics(data.metrics.searchStats);
          setLastUpdated(new Date());
        }
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Search Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Loading metrics...
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceColor = (responseTime: string) => {
    const time = parseInt(responseTime);
    if (time < 100) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (time < 300) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getCacheHitColor = (hitRate: string) => {
    const rate = parseFloat(hitRate);
    if (rate > 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (rate > 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Search Performance
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchMetrics}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Response Time */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Response Time</span>
            </div>
            <Badge className={getPerformanceColor(metrics.averageResponseTime)}>
              {metrics.averageResponseTime}
            </Badge>
          </div>

          {/* Cache Hit Rate */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cache Hit Rate</span>
            </div>
            <Badge className={getCacheHitColor(metrics.cacheHitRate)}>
              {metrics.cacheHitRate}
            </Badge>
          </div>

          {/* Total Searches */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Searches</span>
            </div>
            <Badge variant="outline">
              {metrics.totalSearches}
            </Badge>
          </div>

          {/* Cache Size */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cache Size</span>
            </div>
            <Badge variant="outline">
              {metrics.cacheSize}
            </Badge>
          </div>
        </div>

        {/* Performance Status */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Performance Status:</span>
            <Badge 
              variant={parseInt(metrics.averageResponseTime) < 200 ? "default" : "destructive"}
            >
              {parseInt(metrics.averageResponseTime) < 200 ? 'Optimal' : 'Needs Optimization'}
            </Badge>
          </div>
        </div>

        {/* Cache Details */}
        <div className="mt-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Cache Hits: {metrics.cacheHits}</span>
            <span>Cache Misses: {metrics.cacheMisses}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
