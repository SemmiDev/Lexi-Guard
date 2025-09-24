import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Grammar Checker - AI-Powered Writing Assistant',
  description: 'Check grammar for English and Indonesian with AI-powered suggestions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
