import { searchContactsPaginated } from '@/lib/storage';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    if (!query.trim()) {
      return new Response(JSON.stringify({ contacts: [], pagination: { currentPage: page, itemsPerPage: limit, totalItems: 0, totalPages: 1 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const { contacts, pagination } = await searchContactsPaginated(query, page, limit);
    return new Response(JSON.stringify({ contacts, pagination }), {
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