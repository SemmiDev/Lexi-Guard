'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AlertCircle, Trash2, Copy, Home, MoreVerticalIcon, ArrowDown, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error';
import ReactMarkdown from 'react-markdown';

interface HistoryItem {
    _id: string;
    originalText: string;
    correctedText: string;
    suggestions: Array<{ original: string; suggestion: string; explanation: string }>;
    createdAt: string;
}

interface HistoryResponse {
    history: HistoryItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}

export default function HistoryPage() {
    const { data: session, status } = useSession();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    const fetchHistory = useCallback(async (pageNum: number, reset = false) => {
        if (!session || loading) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/history?page=${pageNum}&limit=25`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch history');
            }

            const data: HistoryResponse = await response.json();

            setHistory((prev) => (reset ? data.history : [...prev, ...data.history]));
            setHasMore(data.hasMore);
            setTotalPages(data.totalPages);
            setPage(data.page);
        } catch (err) {
            setError(getErrorMessage(err));
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    }, [session, status]);

    useEffect(() => {
        if (status === 'authenticated' && session) {
            fetchHistory(1, true);
        }
    }, [status, session, fetchHistory]);

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

            setHistory((prev) => prev.filter((item) => item._id !== id));
            toast.success('History item deleted successfully', {
                style: { background: 'oklch(0.85 0.15 310)', color: 'white', border: '1px solid oklch(0.90 0.05 300)' },
            });

            // Refetch first page if the current page becomes empty
            if (history.length === 1 && page > 1) {
                setPage(1);
                fetchHistory(1, true);
            }
        } catch (err) {
            setError(getErrorMessage(err));
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

    const speakText = (text: string) => {
        if (!text) return;

        // Stop dulu biar tidak numpuk
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // 🎯 Bahasa & voice (fixed ke English UK)
        utterance.lang = "en-GB";
        const voices = window.speechSynthesis.getVoices();

        // Pilih voice English UK kalau ada, fallback ke English lain, lalu default
      utterance.voice =
        voices.find(v => v.lang === "en-GB" && v.name.toLowerCase().includes("female")) ||
        voices.find(v => v.lang === "en-GB") || // fallback ke UK voice lain
        voices.find(v => v.lang.startsWith("en")) || // fallback ke English lain
        voices.find(v => v.default) ||
        null;

        // 🎛️ Kontrol kualitas suara
        utterance.rate = 0.9;   // speed (0.1 - 10)
        utterance.pitch = 1.0;  // pitch (0 - 2)
        utterance.volume = 1;   // volume (0 - 1)

        // 🧩 Event listener for debugging / interactivity
        utterance.onstart = () => {
            console.log("🔊 Speaking (English UK)...");
        };
        utterance.onend = () => {
            console.log("✅ Finished speaking.");
        };
        utterance.onerror = (e) => {
            console.error("⚠️ Speech synthesis error:", e);
        };

        // Highlight current word (optional)
        utterance.onboundary = (event) => {
            if (event.name === "word") {
                console.log(
                    `📍 Speaking at index ${event.charIndex} (type: ${event.name})`
                );
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    const handleLoadMore = () => {
        if (hasMore && !loading) {
            fetchHistory(page + 1);
        }
    };

    if (status === 'loading') {
        return (
            <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 max-w-5xl">
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl bg-bubblegum-lavender/10" />
                    ))}
                </div>
            </div>
        );
    }

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
                    Riwayat
                </h1>
                <p className="text-bubblegum-mint mt-2 text-sm sm:text-base">
                    Berikut riwayat yang kamu simpan ✨
                </p>
                <Button asChild variant="default" className="mt-3 rounded-xl">
                    <Link href="/">
                        <Home />
                        Kembali
                    </Link>
                </Button>
            </header>

            {error && (
                <Card className="border-bubblegum-pink bg-bubblegum-pink/10 rounded-xl shadow-soft mb-6">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <AlertCircle className="h-6 w-6 text-bubblegum-pink" />
                        <p className="text-base text-bubblegum-pink font-medium">{error}</p>
                    </CardContent>
                </Card>
            )}

            {loading && history.length === 0 ? (
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
                                    {new Date(item.createdAt).toLocaleString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => copyText(item.correctedText)}
                                        className="rounded-xl hover:animate-pop"
                                    >
                                        <Copy />
                                        Salin
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => speakText(item.correctedText)}
                                        disabled={!item.correctedText}
                                        className="rounded-xl hover:animate-pop"
                                    >
                                        <Volume2 />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={deletingId === item._id}
                                                className="rounded-xl"
                                            >
                                                <Trash2 />
                                                Hapus
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-xl bg-white dark:bg-bubblegum-lavender/10 border-bubblegum-lavender">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-bubblegum-lavender">Kamu yakin?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-bubblegum-mint">
                                                    Data ini akan dihapus permanen
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(item._id)}>
                                                    Hapus
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2 text-bubblegum-lavender">Teks yang telah di koreksi</h3>
                                    <p className="text-bubblegum-lavender whitespace-pre-wrap">{item.correctedText}</p>
                                </div>
                                {item.suggestions && item.suggestions.length > 0 && (
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="suggestions">
                                            <AccordionTrigger className="text-bubblegum-lavender hover:text-bubblegum-pink">
                                                Saran Perbaikan ({item.suggestions.length})
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
                                                                <div className="prose prose-sm text-bubblegum-mint">
                                                                    <ReactMarkdown>{sug.suggestion}</ReactMarkdown>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 prose prose-sm text-bubblegum-mint">
                                                                <ReactMarkdown>{sug.explanation}</ReactMarkdown>
                                                            </div>
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
                        <div className="text-center mt-6 flex items-center justify-center gap-4">
                            <p className="text-bubblegum-mint">
                                Halaman {page} dari {totalPages}
                            </p>
                            <Button
                                variant={'secondary'}
                                onClick={handleLoadMore}
                                disabled={loading || !hasMore}
                            >
                                {loading ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                ) : null}
                                <ArrowDown />
                                Lebih Banyak
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-center text-bubblegum-mint py-8 font-medium text-lg sm:text-xl">
                    Belum ada riwayat. ✨
                </p>
            )}
        </div>
    );
}
