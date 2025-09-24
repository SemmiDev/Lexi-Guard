'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome, ArrowRight } from 'lucide-react';

export default function HalamanAutentikasi() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">Selamat Datang di LexiGuard</CardTitle>
          <CardDescription className="text-base">
            Masuk untuk mengakses pemeriksaan tata bahasa menggunakan AI untuk Bahasa Inggris dan Indonesia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-center text-sm text-muted-foreground">
            <p>✨ Saran tata bahasa secara real-time</p>
            <p>🌐 Dukungan untuk Bahasa Inggris dan Indonesia</p>
            <p>🎨 Beragam gaya penulisan</p>
            <p>⚡ Didukung oleh Google Gemini AI</p>
          </div>

          <Button
            onClick={() => signIn('google', { callbackUrl: 'http://localhost:3000/api/auth/callback/google' })}
            className="w-full bg-primary hover:bg-primary/90 transition-colors"
            size="lg"
          >
            <Chrome className="mr-2 h-5 w-5" />
            Lanjutkan dengan Google
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Dengan masuk, Anda menyetujui <a href="/terms" className="underline hover:text-primary">Syarat Layanan</a> dan <a href="/privacy" className="underline hover:text-primary">Kebijakan Privasi</a> kami
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
