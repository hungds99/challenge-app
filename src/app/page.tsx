import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  return (
    <div className='flex flex-col items-center'>
      <div className='text-center mb-12'>
        <h1 className='text-5xl font-bold text-gray-900 mb-6'>Welcome to the Challenge Hub</h1>
        <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
          Improve your coding skills by taking part in exciting challenges created by the community.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12'>
        <Card className='flex flex-col items-center text-center h-full'>
          <CardHeader>
            <div className='bg-blue-100 p-4 rounded-full mb-4 mx-auto'>
              <Image src='/file.svg' width={32} height={32} alt='Challenge' />
            </div>
            <CardTitle className='text-xl'>Take on Challenges</CardTitle>
            <CardDescription className='text-gray-600'>
              Test your skills with various coding challenges across different difficulty levels.
            </CardDescription>
          </CardHeader>
          <CardFooter className='mt-auto w-full flex justify-center'>
            <Button asChild variant='default' className='bg-blue-600 hover:bg-blue-700'>
              <Link href='/challenges'>Browse Challenges</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className='flex flex-col items-center text-center h-full'>
          <CardHeader>
            <div className='bg-green-100 p-4 rounded-full mb-4 mx-auto'>
              <Image src='/globe.svg' width={32} height={32} alt='Community' />
            </div>
            <CardTitle className='text-xl'>Join the Community</CardTitle>
            <CardDescription className='text-gray-600'>
              Connect with other developers, share solutions, and learn together.
            </CardDescription>
          </CardHeader>
          <CardFooter className='mt-auto w-full flex justify-center'>
            <Button asChild variant='default' className='bg-green-600 hover:bg-green-700'>
              <Link href='/register'>Sign Up</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className='flex flex-col items-center text-center h-full'>
          <CardHeader>
            <div className='bg-purple-100 p-4 rounded-full mb-4 mx-auto'>
              <Image src='/window.svg' width={32} height={32} alt='Create' />
            </div>
            <CardTitle className='text-xl'>Create Challenges</CardTitle>
            <CardDescription className='text-gray-600'>
              Design your own coding challenges and share them with the community.
            </CardDescription>
          </CardHeader>
          <CardFooter className='mt-auto w-full flex justify-center'>
            <Button asChild variant='default' className='bg-purple-600 hover:bg-purple-700'>
              <Link href='/challenges/create'>Create Challenge</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className='w-full max-w-5xl bg-blue-50 border-0 mb-8'>
        <CardContent className='p-8'>
          <div className='flex flex-col md:flex-row items-center justify-between'>
            <div className='mb-6 md:mb-0 md:mr-8'>
              <CardTitle className='text-2xl mb-3'>Ready to get started?</CardTitle>
              <CardDescription className='text-gray-700'>
                Join our community and start improving your skills today.
              </CardDescription>
            </div>
            <Button asChild size='lg' className='bg-blue-600 hover:bg-blue-700'>
              <Link href='/challenges'>View All Challenges</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
