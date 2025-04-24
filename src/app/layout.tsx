import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Challenge Hub',
  description: 'A platform for creating and participating in coding challenges',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className='h-full'>
      <body className={`${inter.className} h-full overflow-hidden`}>
        <AuthProvider>
          <div className='flex flex-col h-screen'>
            <Navigation className='sticky top-0 z-10' />
            <main className='flex-grow overflow-auto'>
              <div className='max-w-7xl w-full h-full mx-auto py-8 px-4 sm:px-6 lg:px-8'>
                {children}
              </div>
            </main>
            <Footer className='sticky bottom-0 z-10' />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
