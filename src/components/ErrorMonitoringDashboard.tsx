'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  RefreshCw, 
  Activity,
  Shield,
  TrendingUp,
  Clock
} from 'lucide-react';

interface ErrorStats {
  totalErrors: number;
  errorsByLevel: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
  recentErrors: Array<{
    id: string;
    timestamp: string;
    level: string;
    message: string;
    endpoint?: string;
    method?: string;
  }>;
  errorRate: number;
}

interface ErrorMonitoringData {
  success: boolean;
  stats: ErrorStats;
  health: {
    isHealthy: boolean;
    timestamp: string;
  };
  recentErrors?: Array<{
    id: string;
    timestamp: string;
    level: string;
    message: string;
    endpoint?: string;
    method?: string;
  }>;
}

export function ErrorMonitoringDashboard() {
  const [data, setData] = useState<ErrorMonitoringData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRecentErrors, setShowRecentErrors] = useState(false);

  const fetchErrorStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/monitoring/errors?recent=true&limit=20');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch error stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrorStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchErrorStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Error Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Loading error statistics...
          </div>
        </CardContent>
      </Card>
    );
  }

  const { stats, health } = data;

  const getHealthColor = (isHealthy: boolean) => {
    return isHealthy 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warn': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Error Monitoring
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRecentErrors(!showRecentErrors)}
              className="h-8 px-2"
            >
              {showRecentErrors ? 'Hide' : 'Details'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchErrorStats}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
        {health.timestamp && (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(health.timestamp).toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">System Health:</span>
          </div>
          <Badge className={getHealthColor(health.isHealthy)}>
            {health.isHealthy ? 'Healthy' : 'Unhealthy'}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Errors</span>
            </div>
            <Badge variant="outline" className="text-lg">
              {stats.totalErrors}
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Error Rate</span>
            </div>
            <Badge variant="outline">
              {stats.errorRate}/min
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Recent (1min)</span>
            </div>
            <Badge variant="outline">
              {stats.recentErrors.length}
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Endpoints</span>
            </div>
            <Badge variant="outline">
              {Object.keys(stats.errorsByEndpoint).length}
            </Badge>
          </div>
        </div>

        {/* Error Levels */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Error Levels</h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(stats.errorsByLevel).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="flex items-center gap-2">
                  {getLevelIcon(level)}
                  <span className="text-sm capitalize">{level}</span>
                </div>
                <Badge className={getLevelColor(level)}>
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Top Error Endpoints */}
        {Object.keys(stats.errorsByEndpoint).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Top Error Endpoints</h4>
            <div className="space-y-1">
              {Object.entries(stats.errorsByEndpoint)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([endpoint, count]) => (
                  <div key={endpoint} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                    <span className="font-mono text-xs truncate">{endpoint}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recent Errors */}
        {showRecentErrors && data.recentErrors && data.recentErrors.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-medium">Recent Errors</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {data.recentErrors.map((error) => (
                <div key={error.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getLevelIcon(error.level)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{error.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          {error.endpoint && (
                            <span className="font-mono">{error.endpoint}</span>
                          )}
                          {error.method && (
                            <span>{error.method}</span>
                          )}
                          <span>{new Date(error.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getLevelColor(error.level)}>
                      {error.level}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
