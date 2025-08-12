import { NextRequest, NextResponse } from 'next/server'
import { demoUsers, verifyPassword, generateToken, type LoginCredentials } from '@/lib/auth'
import { authLimiter } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  try {
    await new Promise((resolve, reject) => {
      authLimiter(request as any, {
        status: (code: number) => ({ json: (data: any) => reject(new Error(JSON.stringify(data))) }),
        json: (data: any) => reject(new Error(JSON.stringify(data)))
      } as any, resolve);
    });
  } catch (error) {
    return NextResponse.json(JSON.parse(error.message), { status: 429 });
  }

  try {
    const credentials: LoginCredentials = await request.json()
    const { username, password, team } = credentials

    // Validate input
    if (!username || !password || !team) {
      return NextResponse.json(
        { error: 'Username, password, and team are required' },
        { status: 400 }
      )
    }

    // Find user by username and team
    const user = demoUsers.find(u => u.username === username && u.team === team)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create auth user object (without password)
    const authUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      team: user.team,
      role: user.role,
      permissions: user.permissions
    }

    // Generate JWT token
    const token = generateToken(authUser)

    // Update last login
    user.lastLogin = new Date()

    return NextResponse.json({
      success: true,
      token,
      user: authUser,
      message: `Welcome back, ${user.username}!`
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 