import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success response
    // The client will handle clearing the session
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 