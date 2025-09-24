import { GrammarChecker } from '@/components/custom/GrammarChecker';
import { AuthButton } from '@/components/custom/AuthButton';
import Link from 'next/link';
import { Flower, History, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-bubblegum-pink/20 to-bubblegum-blue/20 dark:from-bubblegum-lavender/20 dark:to-bubblegum-blue/30">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 sm:mb-10 md:mb-12 bg-white/80 dark:bg-bubblegum-lavender/10 shadow-lg backdrop-blur-sm rounded-2xl p-5 sm:p-7 border border-muted/30">
                    <div className="flex items-center gap-3 mb-4 md:mb-0">
                        <Flower className="h-10 w-10 text-bubblegum-lavender" />
                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-bubblegum-lavender">
                                Lexi Guard
                            </h1>
                            <p className="text-bubblegum-mint mt-1 text-sm sm:text-base md:text-lg font-medium">
                                Pemeriksa Tata Bahasa Inggris berbasis AI ✨
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Button asChild variant="secondary">
                            <Link href="/history" className="flex items-center gap-2">
                                <History className="h-4 w-4" />
                                Riwayat</Link>
                        </Button>
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
