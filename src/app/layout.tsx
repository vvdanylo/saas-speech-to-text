// src/app/layout.tsx
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import React from 'react';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Voice to Text SaaS',
  description: 'Convert voice recordings into text using AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang={"en"}>
        <body className={inter.className}>
          {children} <Toaster position={'bottom-right'} />
        </body>
      </html>
    </ClerkProvider>
  );
}
