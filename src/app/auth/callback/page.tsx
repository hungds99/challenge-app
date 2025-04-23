'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // The code exchange process is handled automatically by the Supabase client
    const handleAuthCallback = async () => {
      try {
        // Get auth code and session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        // When using OAuth with Supabase, we might want to create or update user profile
        // Check if we received a user from the session
        if (data?.session?.user) {
          const user = data.session.user;
          
          // Check if user exists in our users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          // If user doesn't exist in our database, create a new profile
          if (!userData && !userError) {
            // For Google login, we can extract the username from the email
            const username = user.email?.split('@')[0] || `user_${Math.random().toString(36).substring(2, 10)}`;
            
            // Insert user into our users table
            await supabase.from('users').insert([{
              id: user.id,
              email: user.email,
              username,
              role: 'user',
              points: 0
            }]);
          }
        }

        // Redirect to home page or wherever you want the user to go after login
        router.push('/');
        router.refresh();
      } catch (error) {
        console.error('Error during auth callback:', error);
        router.push('/login?error=Unable to authenticate');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Completing sign in...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we finish authenticating you.
          </p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}