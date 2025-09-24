'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Welcome to Grammar Checker</CardTitle>
          <CardDescription>
            Sign in to access AI-powered grammar checking for English and Indonesian
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>✨ Real-time grammar suggestions</p>
            <p>🌐 Support for English and Indonesian</p>
            <p>🎨 Multiple writing styles</p>
            <p>⚡ Powered by Google Gemini AI</p>
          </div>

          <Button
            onClick={() => signIn('google', { callbackUrl: 'http://localhost:3000/api/auth/callback/google' })}
            className="w-full"
            size="lg"
          >
            <Chrome className="mr-2 h-5 w-5" />
            Continue with Google
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
