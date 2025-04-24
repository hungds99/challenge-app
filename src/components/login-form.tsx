'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginForm() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(formData.email, formData.password);
      router.push('/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      // No need to redirect here as the OAuth flow will handle redirection
    } catch (err) {
      setError('Error signing in with Google');
      console.error(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded'>
          {error}
        </div>
      )}
      <div className='space-y-4'>
        <div>
          <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
            Email address
          </label>
          <Input
            id='email'
            name='email'
            type='email'
            required
            value={formData.email}
            onChange={handleChange}
            placeholder='you@example.com'
          />
        </div>
        <div>
          <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
            Password
          </label>
          <Input
            id='password'
            name='password'
            type='password'
            required
            value={formData.password}
            onChange={handleChange}
            placeholder='Enter your password'
          />
        </div>
      </div>

      <div className='space-y-3'>
        <Button type='submit' disabled={loading} className='w-full' variant='default'>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>

        <div className='flex items-center justify-between my-3'>
          <hr className='w-full border-gray-300' />
          <span className='px-2 text-gray-500 text-sm'>OR</span>
          <hr className='w-full border-gray-300' />
        </div>

        <Button
          type='button'
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          variant='outline'
          className='w-full'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='18'
            height='18'
            viewBox='0 0 48 48'
            className='mr-2'
          >
            <path
              fill='#FFC107'
              d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'
            ></path>
            <path
              fill='#FF3D00'
              d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'
            ></path>
            <path
              fill='#4CAF50'
              d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z'
            ></path>
            <path
              fill='#1976D2'
              d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z'
            ></path>
          </svg>
          {googleLoading ? 'Signing in with Google...' : 'Sign in with Google'}
        </Button>
      </div>
    </form>
  );
}
