import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './Providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Major Scrims - Elite Fortnite Scrims & Customs',
    description: 'A Major Scrims é a comunidade de elite para treinos de Fortnite no Brasil.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt">
            <body className={`${inter.className} bg-black min-h-screen text-white selection:bg-[#1FC058] selection:text-black overflow-x-hidden`}>
                <Providers>
                    <Navbar />
                    <main>{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
