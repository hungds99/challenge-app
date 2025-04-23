import { Award, Plus, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Challenge } from '@/lib/supabase';
import Link from 'next/link';

async function getChallenges() {
  const { data: challenges, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching challenges:', error);
    return [
      {
        id: '1',
        title: 'No challenges available',
        description: 'No challenges available',
        difficulty: 'easy',
        points: 0,
        expected_answers: [],
        explanation: 'No challenges available',
        created_by: 'admin',
        status: 'published',
        created_at: new Date().toISOString(),
      },
    ];
  }

  return challenges as Challenge[];
}

export default async function ChallengesPage() {
  const challenges = await getChallenges();

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold text-gray-900'>Available Challenges</h1>
        <Link
          href='/challenges/create'
          className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center'
        >
          <Plus className="h-4 w-4 mr-1" /> Create Challenge
        </Link>
      </div>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {challenges.map((challenge) => (
          <div key={challenge.id} className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-6'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-semibold text-gray-900'>{challenge.title}</h2>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center ${
                    challenge.difficulty === 'easy'
                      ? 'bg-green-100 text-green-800'
                      : challenge.difficulty === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <Trophy className="h-3 w-3 mr-1" /> {challenge.difficulty}
                </span>
              </div>
              <div className='mt-2 flex items-center'>
                <Award className="h-4 w-4 mr-1 text-blue-600" />
                <span className="text-sm text-gray-600">{challenge.points} points</span>
              </div>
              <div className='mt-4'>
                <Link
                  href={`/challenges/${challenge.id}`}
                  className='text-blue-600 hover:text-blue-800'
                >
                  View Challenge →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
