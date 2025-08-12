'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Zap, 
  RefreshCw, 
  Trash2, 
  Flame,
  Settings,
  Activity
} from 'lucide-react';

export function CacheControls() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCacheAction = async (action: string) => {
    setLoading(action);
    try {
      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message || 'Cache operation completed');
      } else {
        toast.error(data.error || 'Cache operation failed');
      }
    } catch (error) {
      toast.error('Failed to perform cache operation');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Cache Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cache Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCacheAction('warm')}
            disabled={loading === 'warm'}
            className="flex items-center gap-2"
          >
            <Flame className="w-4 h-4" />
            {loading === 'warm' ? 'Warming...' : 'Warm Cache'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCacheAction('clear')}
            disabled={loading === 'clear'}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
            {loading === 'clear' ? 'Clearing...' : 'Clear Cache'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCacheAction('stats')}
            disabled={loading === 'stats'}
            className="flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            {loading === 'stats' ? 'Loading...' : 'Refresh Stats'}
          </Button>
        </div>

        {/* Cache Info */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Cache Information</span>
          </div>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div>• Cache TTL: 15 minutes</div>
            <div>• Max Size: 500 items</div>
            <div>• Auto-eviction: LRU (Least Recently Used)</div>
            <div>• Warming: Common queries pre-loaded</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Quick Actions:</span>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />
              Auto-refresh: 30s
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              In-Memory
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
