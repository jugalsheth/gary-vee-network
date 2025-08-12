'use client';

import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const { user, isLoading, logout, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Is Authenticated:</strong>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <strong>User:</strong>
                <span className="ml-2">{user ? user.username : 'None'}</span>
              </div>
              <div>
                <strong>Team:</strong>
                <span className="ml-2">{user ? user.team : 'None'}</span>
              </div>
              <div>
                <strong>Role:</strong>
                <span className="ml-2">{user ? user.role : 'None'}</span>
              </div>
            </div>
            
            {user && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
                <h3 className="font-semibold mb-2">User Permissions:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(user.permissions, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={logout} variant="destructive">
                Logout
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                Go to Home
              </Button>
              <Button onClick={() => window.location.href = '/login'}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
