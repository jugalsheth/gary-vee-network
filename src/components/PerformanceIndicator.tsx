'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Clock } from 'lucide-react';

interface PerformanceIndicatorProps {
  className?: string;
}

export function PerformanceIndicator({ className = '' }: PerformanceIndicatorProps) {
  const [metrics, setMetrics] = useState<{
    hitRate: string;
    responseTime: string;
    cacheSize: number;
  } | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/contacts/search?query=status&page=1&limit=1');
      if (response.ok) {
        const data = await response.json();
        if (data.metrics?.searchStats) {
          setMetrics({
            hitRate: data.metrics.searchStats.cacheHitRate,
            responseTime: data.metrics.searchStats.averageResponseTime,
            cacheSize: data.metrics.searchStats.cacheSize
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return (
      <Badge variant="outline" className={`text-xs ${className}`}>
        <Activity className="w-3 h-3 mr-1 animate-pulse" />
        Loading...
      </Badge>
    );
  }

  const hitRate = parseFloat(metrics.hitRate);
  const responseTime = parseInt(metrics.responseTime);

  const getStatusColor = () => {
    if (hitRate >= 80 && responseTime <= 100) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (hitRate >= 60 && responseTime <= 200) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getStatusIcon = () => {
    if (hitRate >= 80 && responseTime <= 100) return <Zap className="w-3 h-3 mr-1" />;
    if (hitRate >= 60 && responseTime <= 200) return <Activity className="w-3 h-3 mr-1" />;
    return <Clock className="w-3 h-3 mr-1" />;
  };

  return (
    <Badge className={`text-xs ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      {hitRate}% | {responseTime}ms
    </Badge>
  );
}
