import LoginForm from '@/components/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className='h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Sign in to your account
          </h2>
        </div>
        <LoginForm />
        <p className='mt-2 text-center text-sm text-gray-600'>
          Don&apos;t have an account?{' '}
          <Link href='/register' className='font-medium text-indigo-600 hover:text-indigo-500'>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
