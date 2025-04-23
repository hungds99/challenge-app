import Link from 'next/link';

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-white border-t border-gray-200 mt-auto ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:order-2 space-x-6">
            <Link href="/challenges" className="text-gray-500 hover:text-gray-700">
              Challenges
            </Link>
            <Link href="/leaderboard" className="text-gray-500 hover:text-gray-700">
              Leaderboard
            </Link>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              About
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-500">
              &copy; {currentYear} Challenge Hub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}