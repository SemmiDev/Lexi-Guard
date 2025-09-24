'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, AlertCircle, Copy, RefreshCw, Save } from 'lucide-react';
import type { WritingStyleType, GrammarSuggestion, GrammarCheckResponse } from '@/types';

const DEBOUNCE_DELAY = 500;

export function GrammarChecker() {
    const { data: session } = useSession();
    const [text, setText] = useState('');
    const [style, setStyle] = useState<WritingStyleType>('formal');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<GrammarSuggestion[]>([]);
    const [processedText, setProcessedText] = useState('');
    const [detectedLanguage, setDetectedLanguage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);


    // Debounced grammar check function
    const checkGrammar = useCallback(async (inputText: string, selectedStyle: WritingStyleType) => {
        if (!inputText.trim() || !session) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/check-grammar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: inputText,
                    style: selectedStyle,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to check grammar');
            }

            const data: GrammarCheckResponse = await response.json();
            setSuggestions(data.suggestions);
            setProcessedText(data.processedText);
            setDetectedLanguage(data.detectedLanguage);
        } catch (err) {
            setError('Failed to check grammar. Please try again.');
            console.error('Grammar check error:', err);
        } finally {
            setLoading(false);
        }
    }, [session]);

    // Handle text change with debounce
    const handleTextChange = useCallback((newText: string) => {
        setText(newText);
        setSaveSuccess(false);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (newText.trim()) {
            debounceTimer.current = setTimeout(() => {
                checkGrammar(newText, style);
            }, DEBOUNCE_DELAY);
        } else {
            setSuggestions([]);
            setProcessedText('');
            setDetectedLanguage('');
        }
    }, [style, checkGrammar]);

    // Handle style change
    const handleStyleChange = useCallback((newStyle: WritingStyleType) => {
        setStyle(newStyle);
        if (text.trim()) {
            checkGrammar(text, newStyle);
        }
    }, [text, checkGrammar]);

    // Apply suggestion
    const applySuggestion = useCallback((suggestion: GrammarSuggestion) => {
        const newText = text.substring(0, suggestion.startIndex) +
            suggestion.suggestion +
            text.substring(suggestion.endIndex);
        setText(newText);
        handleTextChange(newText);
    }, [text, handleTextChange]);

    // Copy processed text
    const copyProcessedText = useCallback(() => {
        navigator.clipboard.writeText(processedText);
    }, [processedText]);

    // Save history
    const saveHistory = useCallback(async () => {
        if (!processedText || !session) return;

        setIsSaving(true);
        try {
            const response = await fetch('/api/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    originalText: text,
                    correctedText: processedText,
                    suggestions,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save history');
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (err) {
            setError('Failed to save history. Please try again.');
            console.error('Save history error:', err);
        } finally {
            setIsSaving(false);
        }
    }, [text, processedText, suggestions, session]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    if (!session) {
        return (
            <Card className="w-full max-w-3xl mx-auto shadow-soft rounded-xl bg-white dark:bg-bubblegum-lavender/10 border-bubblegum-lavender">
                <CardHeader>
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-bubblegum-lavender">Pemeriksa Tata Bahasa</CardTitle>
                    <CardDescription className="text-bubblegum-mint">
                        Silakan masuk untuk menggunakan pemeriksa tata bahasa
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 p-4 sm:p-6 md:p-8">
            {/* Input Section */}
            <Card className="shadow-soft rounded-xl bg-white dark:bg-bubblegum-lavender/10 border-bubblegum-lavender">
                <CardHeader>
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-bubblegum-lavender">Masukkan Teks Anda</CardTitle>
                    <CardDescription className="text-bubblegum-mint">
                        Ketik atau tempel teks Anda di bawah ini. Pemeriksaan tata bahasa akan dimulai secara otomatis.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        value={text}
                        onChange={(e) => handleTextChange(e.target.value)}
                        placeholder="Mulai mengetik atau tempel teks Anda di sini..."
                        className="min-h-[150px] sm:min-h-[200px] resize-none rounded-lg bg-bubblegum-lavender/5 border-bubblegum-lavender text-bubblegum-lavender placeholder:text-bubblegum-mint/70 focus:ring-bubblegum-pink focus:ring-2 transition-all duration-200"
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-bubblegum-lavender">Gaya Penulisan:</span>
                                <Select value={style} onValueChange={handleStyleChange}>
                                    <SelectTrigger className="w-[150px] rounded-xl bg-bubblegum-mint border-bubblegum-lavender text-bubblegum-lavender shadow-soft hover:bg-bubblegum-mint/80 transition-all duration-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl bg-white dark:bg-bubblegum-lavender/10 border-bubblegum-lavender">
                                        <SelectItem value="formal" className="text-bubblegum-lavender hover:bg-bubblegum-mint/20">Formal</SelectItem>
                                        <SelectItem value="casual" className="text-bubblegum-lavender hover:bg-bubblegum-mint/20">Santai</SelectItem>
                                        <SelectItem value="informal" className="text-bubblegum-lavender hover:bg-bubblegum-mint/20">Informal</SelectItem>
                                        <SelectItem value="gen-z" className="text-bubblegum-lavender hover:bg-bubblegum-mint/20">Gen-Z</SelectItem>
                                        <SelectItem value="academic" className="text-bubblegum-lavender hover:bg-bubblegum-mint/20">Akademik</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {detectedLanguage && (
                                <Badge variant="secondary" className="rounded-full bg-bubblegum-yellow text-bubblegum-lavender border-bubblegum-yellow font-medium">
                                    {detectedLanguage}
                                </Badge>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={saveHistory}
                                disabled={isSaving || saveSuccess || !processedText}
                            >
                                {isSaving ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : saveSuccess ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2 text-white" />
                                        Tersimpan!
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Simpan Riwayat
                                    </>
                                )}
                            </Button>
                            <div className="flex items-center gap-2 text-sm text-bubblegum-lavender">
                                {loading && (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin text-bubblegum-pink" />
                                        <span>Sedang Memeriksa...</span>
                                    </>
                                )}
                                {!loading && text && (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 text-bubblegum-mint" />
                                        <span>{text.length} karakter</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="border-bubblegum-pink bg-bubblegum-pink/5 rounded-xl shadow-soft">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <AlertCircle className="h-6 w-6 text-bubblegum-pink" />
                        <p className="text-base text-bubblegum-pink font-medium">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Suggestions Section */}
            {(loading || suggestions.length > 0) && (
                <Card className="shadow-soft rounded-xl bg-white dark:bg-bubblegum-lavender/10 border-bubblegum-lavender">
                    <CardHeader>
                        <CardTitle className="text-2xl sm:text-3xl font-bold text-bubblegum-lavender">Saran Tata Bahasa</CardTitle>
                        <CardDescription className="text-bubblegum-mint">
                            Klik pada saran untuk menerapkannya ke teks Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-20 w-full rounded-lg bg-bubblegum-lavender/10" />
                                ))}
                            </div>
                        ) : suggestions.length > 0 ? (
                            <div className="space-y-4">
                                {suggestions.map((suggestion, index) => (
                                    <Card
                                        key={index}
                                        className="cursor-pointer hover:bg-bubblegum-yellow/10 transition-all rounded-lg shadow-soft border-bubblegum-lavender"
                                        onClick={() => applySuggestion(suggestion)}
                                    >
                                        <CardContent className="pt-4">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2 flex-wrap overflow-x-auto pb-2">
                                                        <Badge variant="outline" className="text-bubblegum-pink border-bubblegum-pink rounded-full font-medium">
                                                            {suggestion.original}
                                                        </Badge>
                                                        <span className="text-sm text-bubblegum-lavender">→</span>
                                                        <Badge variant="outline" className="text-bubblegum-mint border-bubblegum-mint rounded-full font-medium">
                                                            {suggestion.suggestion}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-bubblegum-mint">
                                                        {suggestion.explanation}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="rounded-xl hover:animate-pop"
                                                >
                                                    Terapkan
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-bubblegum-mint py-8 font-medium">
                                Tidak ada masalah tata bahasa yang ditemukan! Teks Anda terlihat bagus ✨
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Processed Text Section */}
            {processedText && processedText !== text && (
                <Card className="shadow-soft rounded-xl bg-white dark:bg-bubblegum-lavender/10 border-bubblegum-lavender">
                    <CardHeader>
                        <CardTitle className="text-2xl sm:text-3xl font-bold text-bubblegum-lavender">Teks yang Telah Diperbaiki</CardTitle>
                        <CardDescription className="text-bubblegum-mint">
                            Versi teks Anda yang telah diperbaiki sepenuhnya
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <div className="p-4 bg-bubblegum-lavender/5 rounded-lg shadow-inner">
                                <p className="whitespace-pre-wrap text-bubblegum-lavender">{processedText}</p>
                            </div>
                            <Button
                                onClick={copyProcessedText}
                                size="sm"
                                variant="default"
                                className="absolute top-3 right-3 rounded-xl shadow-soft hover:shadow-md transition-all duration-200 hover:animate-pop"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Salin
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
