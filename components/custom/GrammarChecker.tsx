'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, AlertCircle, Copy, RefreshCw } from 'lucide-react';
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
  const debounceTimer = useRef<NodeJS.Timeout>();

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

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced check
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
    // Trigger new check after applying suggestion
    handleTextChange(newText);
  }, [text, handleTextChange]);

  // Copy processed text
  const copyProcessedText = useCallback(() => {
    navigator.clipboard.writeText(processedText);
  }, [processedText]);

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
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Grammar Checker</CardTitle>
          <CardDescription>Please sign in to use the grammar checker</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Text</CardTitle>
          <CardDescription>
            Type or paste your text below. Grammar checking will start automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Start typing or paste your text here..."
            className="min-h-[200px] resize-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Writing Style:</span>
                <Select value={style} onValueChange={handleStyleChange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="informal">Informal</SelectItem>
                    <SelectItem value="gen-z">Gen-Z</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {detectedLanguage && (
                <Badge variant="secondary">
                  {detectedLanguage}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {loading && (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Checking...</span>
                </>
              )}
              {!loading && text && (
                <>
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span>{text.length} characters</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Suggestions Section */}
      {(loading || suggestions.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Grammar Suggestions</CardTitle>
            <CardDescription>
              Click on a suggestion to apply it to your text
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-red-500">
                              {suggestion.original}
                            </Badge>
                            <span className="text-sm text-muted-foreground">→</span>
                            <Badge variant="outline" className="text-green-500">
                              {suggestion.suggestion}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.explanation}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">
                          Apply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No grammar issues found! Your text looks good.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Processed Text Section */}
      {processedText && processedText !== text && (
        <Card>
          <CardHeader>
            <CardTitle>Corrected Text</CardTitle>
            <CardDescription>
              The fully corrected version of your text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap">{processedText}</p>
              </div>
              <Button
                onClick={copyProcessedText}
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
