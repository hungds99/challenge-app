import Link from 'next/link';
import Image from 'next/image';

export default async function Home() {
  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Welcome to the Challenge Hub</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Improve your coding skills by taking part in exciting challenges created by the community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <Image src="/file.svg" width={32} height={32} alt="Challenge" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Take on Challenges</h2>
          <p className="text-gray-600 mb-4">Test your skills with various coding challenges across different difficulty levels.</p>
          <Link
            href="/challenges"
            className="mt-auto px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Browse Challenges
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
          <div className="bg-green-100 p-4 rounded-full mb-4">
            <Image src="/globe.svg" width={32} height={32} alt="Community" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Join the Community</h2>
          <p className="text-gray-600 mb-4">Connect with other developers, share solutions, and learn together.</p>
          <Link
            href="/register"
            className="mt-auto px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
          >
            Sign Up
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
          <div className="bg-purple-100 p-4 rounded-full mb-4">
            <Image src="/window.svg" width={32} height={32} alt="Create" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Create Challenges</h2>
          <p className="text-gray-600 mb-4">Design your own coding challenges and share them with the community.</p>
          <Link
            href="/challenges/create"
            className="mt-auto px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-700"
          >
            Create Challenge
          </Link>
        </div>
      </div>

      <div className="w-full max-w-5xl bg-blue-50 p-8 rounded-lg mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:mr-8">
            <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
            <p className="text-gray-700">Join our community and start improving your skills today.</p>
          </div>
          <Link
            href="/challenges"
            className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium"
          >
            View All Challenges
          </Link>
        </div>
      </div>
    </div>
  )
}
