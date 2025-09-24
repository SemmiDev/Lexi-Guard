'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User } from 'lucide-react';

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <Button
        disabled
        variant="outline"
        className="rounded-xl bg-bubblegum-lavender/20 border-bubblegum-lavender animate-pulse shadow-soft"
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-bubblegum-pink border-t-transparent" />
      </Button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-bubblegum-mint/20 px-3 py-2 text-bubblegum-lavender shadow-soft">
          <User className="h-5 w-5 text-bubblegum-pink" />
          <span className="text-sm font-medium">{session.user?.name}</span>
        </div>
        <Button
          onClick={() => signOut()}
          variant="destructive"
          size="sm"
        >
          <LogOut className="group-hover:scale-110 transition-transform" />
          Keluar
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn('google')}
      variant="default"
      size="lg"
      className="w-full sm:w-auto rounded-xl bg-bubblegum-pink text-white hover:bg-bubblegum-mint hover:text-bubblegum-lavender shadow-soft hover:shadow-md transition-all duration-300 ease-in-out hover:animate-pop"
    >
      <LogIn className="mr-2 h-5 w-5" />
      Masuk dengan Google
    </Button>
  );
}
