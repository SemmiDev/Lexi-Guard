import { GrammarChecker } from '@/components/custom/GrammarChecker';
import { AuthButton } from '@/components/custom/AuthButton';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-bubblegum-pink/20 to-bubblegum-blue/20 dark:from-bubblegum-lavender/20 dark:to-bubblegum-blue/30">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 sm:mb-10 md:mb-12 bg-white dark:bg-bubblegum-lavender/10 shadow-soft rounded-xl p-4 sm:p-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-bubblegum-lavender">
              LexiGuard
            </h1>
            <p className="text-bubblegum-mint mt-2 text-sm sm:text-base">
              Your AI-powered writing assistant ✨
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/history"
              className="rounded-xl bg-bubblegum-lavender/20 border-bubblegum-lavender animate-pulse shadow-soft"
            >
              History
            </Link>
            <AuthButton />
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          <GrammarChecker />
        </div>
      </div>
    </main>
  );
}
