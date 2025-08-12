'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CompactCacheMonitor } from '@/components/CachePerformanceMonitor';
import { SearchPerformanceMonitor } from '@/components/SearchPerformanceMonitor';
import { CacheAnalytics } from '@/components/CacheAnalytics';
import { CacheControls } from '@/components/CacheControls';
import { ErrorMonitoringDashboard } from '@/components/ErrorMonitoringDashboard';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Zap,
  Settings,
  Monitor
} from 'lucide-react';

export function PerformanceDashboard() {
  const [open, setOpen] = useState(false);

  // Listen for custom event from command palette
  React.useEffect(() => {
    const handleOpenDashboard = () => {
      setOpen(true);
    };

    window.addEventListener('openPerformanceDashboard', handleOpenDashboard);
    return () => {
      window.removeEventListener('openPerformanceDashboard', handleOpenDashboard);
    };
  }, []);

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="fixed bottom-4 right-4 z-50 shadow-lg bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">Performance</span>
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                    <Activity className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Performance Dashboard</p>
              <p className="text-xs text-muted-foreground">Cmd+K → "Performance"</p>
            </TooltipContent>
          </Tooltip>
        </DialogTrigger>
      
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Performance Dashboard
            <Badge variant="outline" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Monitor search performance, cache efficiency, and system health
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CompactCacheMonitor />
            <SearchPerformanceMonitor />
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CacheAnalytics />
            <CacheControls />
          </div>

          {/* Error Monitoring */}
          <ErrorMonitoringDashboard />

          {/* Performance Tips */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Performance Tips</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Hit Rate ≥80% = Excellent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Response Time ≤100ms = Optimal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Cache Size ≥10 items = Healthy</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">Use "Warm Cache" for better performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">Monitor trends over time</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">Cache automatically refreshes every 30s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  );
}
