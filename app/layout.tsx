import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { auth } from '@/lib/auth';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'VroomGo — Aluguel de Veículos',
  description: 'Alugue o carro perfeito para sua jornada. Frota moderna, preços transparentes.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="pt-BR">
        <head>
          <meta name="theme-color" content="#00d084" />
        </head>
        <body suppressHydrationWarning>
          <Navbar />
          <div className="min-h-screen">
            {children}
          </div>
          <Footer />
        </body>
      </html>
    </SessionProvider>
  );
}
