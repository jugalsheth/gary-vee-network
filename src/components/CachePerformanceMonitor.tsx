'use client';

import React, { useState } from 'react';
import { useCache, useCacheStats, usePerformanceMetrics } from './CacheProvider';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  TrendingUp, 
  Database, 
  Zap, 
  Clock, 
  RefreshCw, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Activity,
  BarChart3
} from 'lucide-react';

export function CachePerformanceMonitor() {
  const cacheStats = useCacheStats();
  const performanceMetrics = usePerformanceMetrics();
  const [isExpanded, setIsExpanded] = useState(false);
  const { invalidateCache, clearCache } = useCache();

  const getHitRateColor = (hitRate: string) => {
    const rate = parseFloat(hitRate);
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPerformanceColor = (avgTime: number) => {
    if (avgTime < 100) return 'text-green-600';
    if (avgTime < 300) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCacheKeys = (keys: string[]) => {
    if (keys.length === 0) return 'No cached data';
    if (keys.length <= 3) return keys.join(', ');
    return `${keys.slice(0, 3).join(', ')} +${keys.length - 3} more`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Cache Performance</CardTitle>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cache Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {cacheStats.hitRate}
            </div>
            <div className="text-sm text-gray-600">Hit Rate</div>
            <div className={`inline-block w-3 h-3 rounded-full mt-1 ${getHitRateColor(cacheStats.hitRate)}`} />
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {cacheStats.size}
            </div>
            <div className="text-sm text-gray-600">Cache Size</div>
            <div className="text-xs text-gray-500">
              {cacheStats.size}/{cacheStats.maxSize}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {cacheStats.hits}
            </div>
            <div className="text-sm text-gray-600">Cache Hits</div>
            <div className="text-xs text-gray-500">
              {performanceMetrics.cachedRequests} recent
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {cacheStats.misses}
            </div>
            <div className="text-sm text-gray-600">Cache Misses</div>
            <div className="text-xs text-gray-500">
              {performanceMetrics.apiRequests} recent
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <BarChart3 className="h-4 w-4 text-gray-600" />
            <h4 className="font-medium text-gray-800">Performance Metrics</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-lg font-semibold ${getPerformanceColor(performanceMetrics.averageResponseTime)}`}>
                {performanceMetrics.averageResponseTime}ms
              </div>
              <div className="text-xs text-gray-600">Avg Response</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {performanceMetrics.totalRequests}
              </div>
              <div className="text-xs text-gray-600">Total Requests</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {performanceMetrics.cachedRequests}
              </div>
              <div className="text-xs text-gray-600">Cached</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">
                {performanceMetrics.apiRequests}
              </div>
              <div className="text-xs text-gray-600">API Calls</div>
            </div>
          </div>
        </div>

        {/* Cache Actions */}
        <div className="flex space-x-2">
          <Button
            onClick={invalidateCache}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Cache</span>
          </Button>
          
          <Button
            onClick={clearCache}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All</span>
          </Button>
        </div>

        {/* Expanded Details */}
        <Collapsible open={isExpanded}>
          <CollapsibleContent className="space-y-3">
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-800 mb-2">Cache Keys</h4>
              <div className="bg-gray-50 rounded p-3 text-sm font-mono">
                {formatCacheKeys(cacheStats.keys)}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-800 mb-2">Cache Configuration</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Max Cache Size:</span>
                  <span className="ml-2 font-medium">{cacheStats.maxSize}</span>
                </div>
                <div>
                  <span className="text-gray-600">Current Usage:</span>
                  <span className="ml-2 font-medium">
                    {Math.round((cacheStats.size / cacheStats.maxSize) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-800 mb-2">Cache Benefits</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Faster response times for repeated requests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span>Reduced database load and API calls</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>Improved user experience with instant data</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// Compact version for smaller displays
export function CompactCacheMonitor() {
  const cacheStats = useCacheStats();
  const performanceMetrics = usePerformanceMetrics();
  const { invalidateCache } = useCache();

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">Cache</span>
        </div>
        
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-1">
            <span className="text-gray-600">Hit Rate:</span>
            <Badge variant="secondary" className="text-xs">
              {cacheStats.hitRate}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="text-gray-600">Size:</span>
            <Badge variant="outline" className="text-xs">
              {cacheStats.size}/{cacheStats.maxSize}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="text-gray-600">Avg:</span>
            <Badge variant="outline" className="text-xs">
              {performanceMetrics.averageResponseTime}ms
            </Badge>
          </div>
        </div>
      </div>

      <Button
        onClick={invalidateCache}
        variant="ghost"
        size="sm"
        className="h-8 px-2"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
} 