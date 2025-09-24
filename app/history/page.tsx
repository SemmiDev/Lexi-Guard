'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AlertCircle, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error';

interface HistoryItem {
    _id: string;
    originalText: string;
    correctedText: string;
    suggestions: Array<{ original: string; suggestion: string; explanation: string }>;
    createdAt: string;
}

export default function HistoryPage() {
    const { data: session } = useSession();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchHistory = async (pageNum: number) => {
        if (!session) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/history?page=${pageNum}`);
            if (!response.ok) {
                throw new Error('Failed to fetch history');
            }
            const data = await response.json();
            setHistory((prev) => (pageNum === 1 ? data.history : [...prev, ...data.history]));
            setHasMore(data.hasMore);
        } catch (err) {
            setError(getErrorMessage(error));
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(1);
    }, [session]);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            const response = await fetch('/api/history', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete history item');
            }

            setHistory(history.filter((item) => item._id !== id));
            toast.success('History item deleted successfully', {
                style: { background: 'oklch(0.85 0.15 310)', color: 'white', border: '1px solid oklch(0.90 0.05 300)' },
            });
        } catch (err) {
            setError(getErrorMessage(error));
            console.error('Error deleting history:', err);
        } finally {
            setDeletingId(null);
        }
    };

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Text copied to clipboard!', {
            style: { background: 'oklch(0.92 0.08 180)', color: 'oklch(0.35 0.05 300)', border: '1px solid oklch(0.90 0.05 300)' },
        });
    };

    if (!session) {
        return (
            <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 max-w-5xl">
                <Card className="shadow-soft rounded-xl bg-white dark:bg-bubblegum-lavender/10 border-bubblegum-lavender">
                    <CardHeader>
                        <CardTitle className="text-2xl sm:text-3xl font-bold text-bubblegum-lavender">History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-bubblegum-mint text-base sm:text-lg">Please sign in to view your history.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 max-w-5xl">
            <header className="mb-8 sm:mb-10 md:mb-12">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-bubblegum-lavender">
                    Your History
                </h1>
                <p className="text-bubblegum-mint mt-2 text-sm sm:text-base">
                    Here are your saved grammar checks ✨
                </p>
            </header>

            {error && (
                <Card className="border-bubblegum-pink bg-bubblegum-pink/10 rounded-xl shadow-soft mb-6">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <AlertCircle className="h-6 w-6 text-bubblegum-pink" />
                        <p className="text-base text-bubblegum-pink font-medium">{error}</p>
                    </CardContent>
                </Card>
            )}

            {loading && page === 1 ? (
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl bg-bubblegum-lavender/10" />
                    ))}
                </div>
            ) : history.length > 0 ? (
                <div className="space-y-6">
                    {history.map((item) => (
                        <Card key={item._id} className="shadow-soft rounded-xl bg-white dark:bg-bubblegum-lavender/10 border-bubblegum-lavender">
                            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <CardTitle className="text-xl sm:text-2xl font-bold text-bubblegum-lavender">
                                    {new Date(item.createdAt).toLocaleString()}
                                </CardTitle>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyText(item.correctedText)}
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Corrected
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={deletingId === item._id}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-xl bg-white dark:bg-bubblegum-lavender/10 border-bubblegum-lavender">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-bubblegum-lavender">Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-bubblegum-mint">
                                                    This action cannot be undone. This will permanently delete this history item.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(item._id)}
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2 text-bubblegum-lavender">Original Text</h3>
                                    <div className="relative">
                                        <p className="text-bubblegum-mint whitespace-pre-wrap">{item.originalText}</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="absolute top-2 right-2"
                                            onClick={() => copyText(item.originalText)}
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2 text-bubblegum-lavender">Corrected Text</h3>
                                    <p className="text-bubblegum-lavender whitespace-pre-wrap">{item.correctedText}</p>
                                </div>
                                {item.suggestions && item.suggestions.length > 0 && (
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="suggestions">
                                            <AccordionTrigger className="text-bubblegum-lavender hover:text-bubblegum-pink">
                                                Suggestions ({item.suggestions.length})
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-3">
                                                    {item.suggestions.map((sug, idx) => (
                                                        <div key={idx} className="flex flex-col gap-1 p-3 bg-bubblegum-lavender/5 rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                <Badge className="rounded-full bg-bubblegum-pink/20 text-bubblegum-pink border-bubblegum-pink">
                                                                    {sug.original}
                                                                </Badge>
                                                                <span className="text-bubblegum-lavender">→</span>
                                                                <Badge className="rounded-full bg-bubblegum-mint/20 text-bubblegum-mint border-bubblegum-mint">
                                                                    {sug.suggestion}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-bubblegum-mint">{sug.explanation}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    {hasMore && (
                        <div className="text-center mt-6">
                            <Button
                                onClick={() => {
                                    setPage((prev) => prev + 1);
                                    fetchHistory(page + 1);
                                }}
                                className="rounded-xl bg-bubblegum-pink text-white hover:bg-bubblegum-pink/80 shadow-soft hover:shadow-md transition-all hover:animate-pop"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                ) : null}
                                Load More
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-center text-bubblegum-mint py-8 font-medium text-lg sm:text-xl">
                    You have no saved history yet. ✨
                </p>
            )}

            <div className="mt-8 text-center">
                <Link
                    href="/"
                >
                    Kembali
                </Link>
            </div>
        </div>
    );
}
