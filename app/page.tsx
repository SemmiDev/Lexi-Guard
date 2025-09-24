import { GrammarChecker } from '@/components/custom/GrammarChecker';
import { AuthButton } from '@/components/custom/AuthButton';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Grammar Checker
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-powered grammar checking for English and Indonesian
            </p>
          </div>
          <AuthButton />
        </header>

        {/* Main Content */}
        <GrammarChecker />
      </div>
    </main>
  );
}
