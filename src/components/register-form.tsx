'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RegisterForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signUp(formData.email, formData.password, formData.username);
      router.push('/');
    } catch {
      setError('Error creating account. Please try again.');
    } finally {
      setLoading(false);
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
          <label htmlFor='username' className='block text-sm font-medium text-gray-700 mb-1'>
            Username
          </label>
          <Input
            id='username'
            name='username'
            type='text'
            required
            value={formData.username}
            onChange={handleChange}
            placeholder='Choose a username'
          />
        </div>
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
            placeholder='Create a secure password'
          />
        </div>
      </div>

      <div>
        <Button type='submit' disabled={loading} className='w-full' variant='default'>
          {loading ? 'Creating account...' : 'Sign up'}
        </Button>
      </div>
    </form>
  );
}
