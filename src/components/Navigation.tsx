'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className }: NavigationProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className={`bg-white shadow ${className}`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex'>
            <div className='flex-shrink-0 flex items-center'>
              <Link href='/' className='text-xl font-bold text-blue-600'>
                Challenge Hub
              </Link>
            </div>
            <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
              <Link
                href='/challenges'
                className='border-transparent text-gray-600 hover:border-blue-500 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors'
              >
                Challenges
              </Link>
              <Link
                href='/leaderboard'
                className='border-transparent text-gray-600 hover:border-blue-500 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors'
              >
                Leaderboard
              </Link>
              {user?.role === 'admin' && (
                <Link
                  href='/admin/review'
                  className='border-transparent text-gray-600 hover:border-blue-500 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors'
                >
                  Review
                </Link>
              )}
            </div>
          </div>
          <div className='hidden sm:ml-6 sm:flex sm:items-center'>
            {user ? (
              <div className='flex items-center space-x-4'>
                <span className='text-sm text-gray-600'>{user.email}</span>
                <Button
                  variant='ghost'
                  onClick={handleSignOut}
                  className='text-sm font-medium text-gray-600 hover:text-blue-700'
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className='flex items-center space-x-4'>
                <Button variant='ghost' asChild>
                  <Link
                    href='/login'
                    className='text-sm font-medium text-gray-600 hover:text-blue-700'
                  >
                    Sign in
                  </Link>
                </Button>
                <Button variant='default' asChild>
                  <Link href='/register'>Sign up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className='flex items-center sm:hidden'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              className='text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
            >
              <span className='sr-only'>Open main menu</span>
              {!mobileMenuOpen ? <Menu className='h-6 w-6' /> : <X className='h-6 w-6' />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(mobileMenuOpen ? 'block' : 'hidden', 'sm:hidden')}>
        <div className='pt-2 pb-3 space-y-1'>
          <Link
            href='/challenges'
            className='block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
          >
            Challenges
          </Link>
          <Link
            href='/leaderboard'
            className='block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
          >
            Leaderboard
          </Link>
          {user?.role === 'admin' && (
            <Link
              href='/admin/review'
              className='block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            >
              Review
            </Link>
          )}
        </div>
        <div className='pt-4 pb-3 border-t border-gray-200'>
          {user ? (
            <div className='space-y-1'>
              <div className='block px-4 py-2 text-base font-medium text-gray-500'>
                {user.email}
              </div>
              <Button
                variant='ghost'
                onClick={handleSignOut}
                className='block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className='space-y-1'>
              <Button variant='ghost' asChild className='w-full justify-start'>
                <Link
                  href='/login'
                  className='block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                >
                  Sign in
                </Link>
              </Button>
              <Button variant='ghost' asChild className='w-full justify-start'>
                <Link
                  href='/register'
                  className='block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                >
                  Sign up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
