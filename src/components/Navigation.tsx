'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
                <button
                  onClick={handleSignOut}
                  className='text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors'
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className='flex items-center space-x-4'>
                <Link href='/login' className='text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors'>
                  Sign in
                </Link>
                <Link href='/register' className='px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors'>
                  Sign up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className='flex items-center sm:hidden'>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
              aria-expanded={mobileMenuOpen}
            >
              <span className='sr-only'>Open main menu</span>
              {/* Icon for menu */}
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                aria-hidden='true'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16M4 18h16' />
              </svg>
              {/* Icon for X */}
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                aria-hidden='true'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
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
              <button
                onClick={handleSignOut}
                className='block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className='space-y-1'>
              <Link
                href='/login'
                className='block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              >
                Sign in
              </Link>
              <Link
                href='/register'
                className='block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
