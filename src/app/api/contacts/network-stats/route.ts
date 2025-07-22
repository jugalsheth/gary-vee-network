import { getNetworkStats } from '@/lib/storage';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const stats = await getNetworkStats();
    return new Response(JSON.stringify(stats), {
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