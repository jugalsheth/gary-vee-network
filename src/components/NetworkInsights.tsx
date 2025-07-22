'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Network, 
  TrendingUp, 
  Target,
  Star,
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from 'lucide-react'
import type { Contact } from '@/lib/types'
import { generateNetworkInsights, getNetworkStatistics } from '@/lib/networkAnalysis'
import { useEffect, useState, useMemo } from 'react';

interface NetworkInsightsProps {
  contacts: Contact[]
  onContactSelect?: (contact: Contact) => void
  onAddConnection?: (contact1: Contact, contact2: Contact) => void
}

export function NetworkInsights({ 
  contacts, 
  onContactSelect, 
  onAddConnection 
}: NetworkInsightsProps) {
  const [insights, setInsights] = React.useState<any>(null)
  const [stats, setStats] = React.useState<any>(null)
  const [analytics, setAnalytics] = useState<{ totalContacts: number } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [networkStats, setNetworkStats] = useState<any>(null);
  const [networkStatsLoading, setNetworkStatsLoading] = useState(true);
  const [networkStatsError, setNetworkStatsError] = useState<string | null>(null);

  // Memoize in-memory analytics for large datasets
  const memoizedInsights = useMemo(() => {
    if (contacts.length > 0) {
      return generateNetworkInsights(contacts);
    }
    return null;
  }, [contacts]);

  const memoizedStats = useMemo(() => {
    if (contacts.length > 0) {
      return getNetworkStatistics(contacts);
    }
    return null;
  }, [contacts]);

  useEffect(() => {
    setInsights(memoizedInsights);
    setStats(memoizedStats);
  }, [memoizedInsights, memoizedStats]);

  useEffect(() => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    fetch('/api/contacts/analytics')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setAnalyticsLoading(false);
      })
      .catch(() => {
        setAnalyticsError('Failed to load analytics');
        setAnalyticsLoading(false);
      });
  }, []);

  useEffect(() => {
    setNetworkStatsLoading(true);
    setNetworkStatsError(null);
    fetch('/api/contacts/network-stats')
      .then(res => res.json())
      .then(data => {
        setNetworkStats(data);
        setNetworkStatsLoading(false);
      })
      .catch(() => {
        setNetworkStatsError('Failed to load network stats');
        setNetworkStatsLoading(false);
      });
  }, []);

  if (analyticsLoading || networkStatsLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Network className="w-8 h-8 mx-auto mb-2" />
            <p>Loading network insights...</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  if (analyticsError || !analytics || networkStatsError || !networkStats) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-red-500">{analyticsError || networkStatsError || 'No analytics data'}</div>
        </CardContent>
      </Card>
    )
  }

  const networkDensityPercent = Math.round((networkStats.networkDensity || 0) * 100)
  const averageDegreeRounded = Math.round((networkStats.averageConnections || 0) * 10) / 10

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Network Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{networkStats.totalContacts}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Contacts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{networkStats.totalConnections}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{networkDensityPercent}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Network Density</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{averageDegreeRounded}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Connections</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Hubs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Network Hubs
            <Badge variant="outline">{networkStats.hubs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {networkStats.hubs.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p>No network hubs identified yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {networkStats.hubs.map((hub: any) => (
                <div key={hub.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{hub.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {(hub.connections || []).length} connections • {hub.tier}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{(hub.connections || []).length} connections</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onContactSelect?.(hub)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Isolated Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Isolated Contacts
            <Badge variant="outline">{networkStats.isolatedContacts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {networkStats.isolatedContacts.length === 0 ? (
            <div className="text-center py-4 text-green-600 dark:text-green-400">
              <Network className="w-8 h-8 mx-auto mb-2" />
              <p>Great! All contacts are connected</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                These contacts have no connections. Consider connecting them to strengthen your network.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {networkStats.isolatedContacts.slice(0, 6).map((contact: any) => (
                  <div key={contact.id} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                        <Users className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{contact.name}</span>
                      <Badge variant="outline" className="text-xs">{contact.tier}</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onContactSelect?.(contact)}
                    >
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
              {networkStats.isolatedContacts.length > 6 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                  +{networkStats.isolatedContacts.length - 6} more isolated contacts
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Connections and Connection Strength Distribution remain in-memory for now */}
      {/* Suggested Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Suggested Connections
            <Badge variant="outline">{insights?.suggestedConnections?.length || 0}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights?.suggestedConnections?.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <Target className="w-8 h-8 mx-auto mb-2" />
              <p>No connection suggestions at this time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.suggestedConnections.slice(0, 5).map((suggestion: any, index: number) => (
                <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{suggestion.contact1.name}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">{suggestion.contact2.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddConnection?.(suggestion.contact1, suggestion.contact2)}
                    >
                      Connect
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.reason}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Strength Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Connection Strength Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-900 dark:text-gray-100">Strong</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{stats?.connectionStrengthDistribution?.strong || 0}</span>
                <Progress 
                  value={stats?.totalConnections ? (stats.connectionStrengthDistribution.strong / stats.totalConnections) * 100 : 0} 
                  className="w-20"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-gray-900 dark:text-gray-100">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{stats?.connectionStrengthDistribution?.medium || 0}</span>
                <Progress 
                  value={stats?.totalConnections ? (stats.connectionStrengthDistribution.medium / stats.totalConnections) * 100 : 0} 
                  className="w-20"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-sm text-gray-900 dark:text-gray-100">Weak</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{stats?.connectionStrengthDistribution?.weak || 0}</span>
                <Progress 
                  value={stats?.totalConnections ? (stats.connectionStrengthDistribution.weak / stats.totalConnections) * 100 : 0} 
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- GLOBAL AI ANALYSIS PLACEHOLDER --- */}
      {/* import { analyzeGlobalNetwork } from '../lib/ai'; */}
      {/* Use analyzeGlobalNetwork(allContacts) for global AI insights */}
    </div>
  )
} 