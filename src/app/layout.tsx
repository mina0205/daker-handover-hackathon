import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/common/Navbar';
import StorageInitializer from '@/components/common/StorageInitializer';

export const metadata: Metadata = {
  title: '해커톤 플랫폼',
  description: '긴급 인수인계 해커톤 웹 서비스',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">
        <StorageInitializer />
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
