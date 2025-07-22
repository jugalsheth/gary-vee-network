'use client'

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getTierBadge } from '@/lib/constants'
import type { Contact } from '@/lib/types'
import type { GlobalAnalytics } from '../lib/types';
import { Users, TrendingUp, UserCheck } from 'lucide-react'

type AnalyticsData = {
  totalContacts: number;
  tier1: number;
  tier2: number;
  tier3: number;
};

const HeaderAnalytics = ({ tier, location, team }: { tier?: string; location?: string; team?: string }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (tier && tier !== 'all') params.append('tier', tier);
    if (location && location !== 'all') params.append('location', location);
    if (team && team !== 'all') params.append('team', team);
    const url = `/api/contacts/analytics${params.toString() ? '?' + params.toString() : ''}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load analytics');
        setLoading(false);
      });
  }, [tier, location, team]);

  if (loading) return <div>Loading analytics...</div>;
  if (error || !analytics) return <div>{error || 'No analytics data'}</div>;

  return (
    <div className="header-analytics">
      <div>Total Contacts: {analytics.totalContacts}</div>
      <div>Tier 1: {analytics.tier1}</div>
      <div>Tier 2: {analytics.tier2}</div>
      <div>Tier 3: {analytics.tier3}</div>
    </div>
  );
};

export default HeaderAnalytics;

export function HeaderAnalyticsMobile({ tier, location, team }: { tier?: string; location?: string; team?: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (tier && tier !== 'all') params.append('tier', tier);
    if (location && location !== 'all') params.append('location', location);
    if (team && team !== 'all') params.append('team', team);
    const url = `/api/contacts/analytics${params.toString() ? '?' + params.toString() : ''}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load analytics');
        setLoading(false);
      });
  }, [tier, location, team]);

  if (loading) return <div>Loading analytics...</div>;
  if (error || !analytics) return <div>{error || 'No analytics data'}</div>;

  return (
    <div>
      <div>Total: {analytics.totalContacts}</div>
      <div>Tier 1: {analytics.tier1}</div>
      <div>Tier 2: {analytics.tier2}</div>
      <div>Tier 3: {analytics.tier3}</div>
    </div>
  );
} 