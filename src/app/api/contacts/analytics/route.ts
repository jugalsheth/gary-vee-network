import { getContactsAnalytics, getContactsAnalyticsWithFilters } from '@/lib/storage';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const tier = searchParams.get('tier') || undefined;
    const location = searchParams.get('location') || undefined;
    const team = searchParams.get('team') || undefined;
    const hasFilters = tier || location || team;
    let analytics;
    if (hasFilters) {
      analytics = await getContactsAnalyticsWithFilters({ tier, location, team });
    } else {
      analytics = await getContactsAnalytics();
    }
    return new Response(JSON.stringify(analytics), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 