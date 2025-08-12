import { NextRequest, NextResponse } from 'next/server';
import { clearSearchCache, getCacheStats, warmSearchCache } from '@/lib/optimized-search';

export async function GET() {
  try {
    const stats = getCacheStats();
    return NextResponse.json({ 
      success: true, 
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get cache stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'clear':
        clearSearchCache();
        return NextResponse.json({ 
          success: true, 
          message: 'Cache cleared successfully' 
        });
        
      case 'warm':
        await warmSearchCache();
        return NextResponse.json({ 
          success: true, 
          message: 'Cache warming completed' 
        });
        
      case 'stats':
        const stats = getCacheStats();
        return NextResponse.json({ 
          success: true, 
          stats 
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Cache operation failed' },
      { status: 500 }
    );
  }
}
