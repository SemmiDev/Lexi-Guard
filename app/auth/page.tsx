'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome, ArrowRight, ShieldCheck, SunMoon, DoorOpen, Flower } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HalamanAutentikasi() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-background dark:via-muted dark:to-background p-6">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-md"
            >
                <Card className="shadow-xl rounded-2xl border border-muted/40 backdrop-blur-sm">
                    <CardHeader className="space-y-4 text-center">
                        <div className="flex justify-center">
                            <Flower className="h-12 w-12 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-extrabold tracking-tight">
                            Selamat Datang di <span className="text-primary">Lexi Guard</span>
                        </CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                            Platform <span className="font-medium text-foreground">pemeriksaan tata bahasa inggris </span>
                            menggunakan AI ✨
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        <div className="space-y-2 text-center text-sm text-muted-foreground">
                            <p>✨ <span className="font-medium">Saran tata bahasa</span> secara real-time</p>
                            <p>🌐 Dukungan untuk <span className="font-medium">Bahasa Inggris & Indonesia</span></p>
                            <p>🎨 Pilihan <span className="font-medium">gaya penulisan</span> yang fleksibel</p>
                            <p>⚡ Didukung oleh <span className="font-medium"> AI</span></p>
                        </div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                variant={'secondary'}
                                onClick={() => signIn('google', { callbackUrl: '/' })}
                                className="w-full transition-all shadow-md"
                                size="lg"
                            >
                                <DoorOpen className="mr-2 h-5 w-5" />
                                Masuk dengan Google
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </motion.div>

                        <p className="text-xs text-center text-muted-foreground leading-relaxed">
                            © {new Date().getFullYear()} <span className="font-medium">Lexi Guard</span>.
                            Dibuat dengan ❤️ oleh <a href="https://github.com/semmidev" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                                Sammi Aldhi Yanto
                            </a>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
