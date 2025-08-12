'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar, 
  Star, 
  Target, 
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download
} from 'lucide-react';
import type { Contact } from '@/lib/types';

interface AdvancedAnalyticsProps {
  contacts: Contact[];
  searchQuery: string;
  filteredCount: number;
}

export function AdvancedAnalytics({ contacts, searchQuery, filteredCount }: AdvancedAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const analytics = useMemo(() => {
    const now = new Date();
    const timeRanges = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    };

    const filteredContacts = contacts.filter(contact => {
      if (!contact.createdAt) return false;
      return new Date(contact.createdAt) >= timeRanges[timeRange];
    });

    // Tier distribution
    const tierDistribution = filteredContacts.reduce((acc, contact) => {
      acc[contact.tier] = (acc[contact.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Location distribution
    const locationDistribution = filteredContacts.reduce((acc, contact) => {
      if (contact.location) {
        acc[contact.location] = (acc[contact.location] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Relationship distribution
    const relationshipDistribution = filteredContacts.reduce((acc, contact) => {
      if (contact.relationshipToGary) {
        acc[contact.relationshipToGary] = (acc[contact.relationshipToGary] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Personal status
    const hasKids = filteredContacts.filter(c => c.hasKids).length;
    const isMarried = filteredContacts.filter(c => c.isMarried).length;

    // Growth rate
    const previousPeriod = new Date(timeRanges[timeRange].getTime() - (timeRanges[timeRange].getTime() - now.getTime()));
    const previousContacts = contacts.filter(contact => {
      if (!contact.createdAt) return false;
      const created = new Date(contact.createdAt);
      return created >= previousPeriod && created < timeRanges[timeRange];
    }).length;

    const growthRate = previousContacts > 0 
      ? ((filteredContacts.length - previousContacts) / previousContacts) * 100 
      : 0;

    return {
      totalContacts: filteredContacts.length,
      tierDistribution,
      locationDistribution,
      relationshipDistribution,
      hasKids,
      isMarried,
      growthRate,
      topLocations: Object.entries(locationDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      topRelationships: Object.entries(relationshipDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  }, [contacts, timeRange]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'tier1': return 'bg-gradient-to-r from-pink-500 to-pink-600';
      case 'tier2': return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      default: return 'bg-gradient-to-r from-green-500 to-green-600';
    }
  };

  const exportAnalytics = () => {
    const data = {
      timeRange,
      analytics,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Insights for {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : timeRange === '90d' ? '90 days' : '1 year'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="rounded-none first:rounded-l-lg last:rounded-r-lg"
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={exportAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalContacts}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.growthRate > 0 ? '+' : ''}{analytics.growthRate.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tier 1 Contacts</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.tierDistribution.tier1 || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalContacts > 0 ? ((analytics.tierDistribution.tier1 || 0) / analytics.totalContacts * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Has Kids</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.hasKids}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalContacts > 0 ? (analytics.hasKids / analytics.totalContacts * 100).toFixed(1) : 0}% of contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Married</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.isMarried}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalContacts > 0 ? (analytics.isMarried / analytics.totalContacts * 100).toFixed(1) : 0}% of contacts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tier Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.tierDistribution).map(([tier, count]) => (
                <div key={tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getTierColor(tier)}`} />
                    <span className="text-sm font-medium">{tier.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getTierColor(tier)}`}
                        style={{ width: `${(count / analytics.totalContacts) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Top Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topLocations.map(([location, count]) => (
                <div key={location} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{location}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(count / analytics.totalContacts) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Impact */}
      {searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredCount}</div>
                <p className="text-sm text-muted-foreground">Results for "{searchQuery}"</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.totalContacts > 0 ? (filteredCount / analytics.totalContacts * 100).toFixed(1) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Match Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.totalContacts - filteredCount}
                </div>
                <p className="text-sm text-muted-foreground">Excluded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
