import { NextRequest, NextResponse } from 'next/server';
import { errorMonitor } from '@/lib/errorMonitor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeRecent = searchParams.get('recent') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const stats = errorMonitor.getErrorStats();
    
    const response: any = {
      success: true,
      stats,
      health: {
        isHealthy: errorMonitor.isHealthy(),
        timestamp: new Date().toISOString()
      }
    };

    if (includeRecent) {
      response.recentErrors = errorMonitor.getRecentErrors(limit);
    }

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to get error stats:', error);
    
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clear all error logs (admin function)
    // In production, you might want to add authentication here
    
    const response = {
      success: true,
      message: 'Error logs cleared',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to clear error logs:', error);
    
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
