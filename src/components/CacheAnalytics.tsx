'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Zap, 
  TrendingUp, 
  Database, 
  Clock, 
  BarChart3,
  Activity,
  Target
} from 'lucide-react';

interface CacheAnalytics {
  totalSearches: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: string;
  averageResponseTime: string;
  cacheSize: number;
  memoryUsage?: string;
  topQueries?: Array<{ query: string; count: number }>;
}

export function CacheAnalytics() {
  const [analytics, setAnalytics] = useState<CacheAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Make a test search to get metrics
      const response = await fetch('/api/contacts/search?query=analytics&page=1&limit=1');
      if (response.ok) {
        const data = await response.json();
        if (data.metrics?.searchStats) {
          setAnalytics(data.metrics.searchStats);
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!analytics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Cache Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Loading analytics...
          </div>
        </CardContent>
      </Card>
    );
  }

  const hitRate = parseFloat(analytics.cacheHitRate);
  const responseTime = parseInt(analytics.averageResponseTime);
  
  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (value <= thresholds.warning) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getCacheEfficiency = () => {
    if (hitRate >= 80) return { status: 'Excellent', color: 'bg-green-500' };
    if (hitRate >= 60) return { status: 'Good', color: 'bg-yellow-500' };
    return { status: 'Needs Improvement', color: 'bg-red-500' };
  };

  const efficiency = getCacheEfficiency();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Cache Analytics
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="h-8 px-2"
            >
              {showDetails ? 'Hide' : 'Details'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAnalytics}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Hit Rate</span>
            </div>
            <Badge className={getPerformanceColor(hitRate, { good: 80, warning: 60 })}>
              {analytics.cacheHitRate}
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Avg Response</span>
            </div>
            <Badge className={getPerformanceColor(responseTime, { good: 100, warning: 200 })}>
              {analytics.averageResponseTime}
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Searches</span>
            </div>
            <Badge variant="outline">
              {analytics.totalSearches}
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cache Size</span>
            </div>
            <Badge variant="outline">
              {analytics.cacheSize}
            </Badge>
          </div>
        </div>

        {/* Cache Efficiency */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cache Efficiency:</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${efficiency.color}`} />
              <span className="font-medium">{efficiency.status}</span>
            </div>
          </div>
          <Progress value={hitRate} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Performance Targets */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Performance Targets</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Hit Rate:</span>
              <span className={hitRate >= 80 ? 'text-green-600' : 'text-red-600'}>
                {hitRate >= 80 ? '✅' : '❌'} ≥80%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Response Time:</span>
              <span className={responseTime <= 100 ? 'text-green-600' : 'text-red-600'}>
                {responseTime <= 100 ? '✅' : '❌'} ≤100ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cache Size:</span>
              <span className={analytics.cacheSize >= 10 ? 'text-green-600' : 'text-yellow-600'}>
                {analytics.cacheSize >= 10 ? '✅' : '⚠️'} ≥10 items
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Searches:</span>
              <span className="text-blue-600">
                {analytics.totalSearches} queries
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        {showDetails && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium">Detailed Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Cache Hits</div>
                <div className="font-medium">{analytics.cacheHits}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Cache Misses</div>
                <div className="font-medium">{analytics.cacheMisses}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Hit/Miss Ratio</div>
                <div className="font-medium">
                  {analytics.cacheHits}:{analytics.cacheMisses}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Memory Usage</div>
                <div className="font-medium">{analytics.memoryUsage || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Recommendations</span>
          </div>
          <div className="text-xs space-y-1">
            {hitRate < 60 && (
              <div>• Increase cache TTL to improve hit rate</div>
            )}
            {responseTime > 200 && (
              <div>• Consider database indexing for faster queries</div>
            )}
            {analytics.cacheSize < 10 && (
              <div>• Implement cache warming for common queries</div>
            )}
            {hitRate >= 80 && responseTime <= 100 && (
              <div>• Cache performance is optimal! 🎉</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
