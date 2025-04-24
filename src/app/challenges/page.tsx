import { Challenge, Profile, supabase } from '@/lib/supabase';
import { Award, Plus, Trophy, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

async function getChallenges() {
  const { data: challenges, error } = await supabase
    .from('challenges')
    .select(
      `
      *,
      profiles:created_by(username)
    `,
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return challenges as (Challenge & { profiles: Pick<Profile, 'username'> })[];
}

export default async function ChallengesPage() {
  const challenges = await getChallenges();

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold text-gray-900'>Available Challenges</h1>
        <Button variant='default' asChild>
          <Link href='/challenges/create' className='flex items-center'>
            <Plus className='h-4 w-4 mr-1' /> Create Challenge
          </Link>
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {challenges.map((challenge) => (
          <Card key={challenge.id}>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>{challenge.title}</CardTitle>
                <Badge
                  variant={
                    challenge.difficulty === 'easy'
                      ? 'success'
                      : challenge.difficulty === 'medium'
                      ? 'secondary'
                      : 'destructive'
                  }
                  className='flex items-center'
                >
                  <Trophy className='h-3 w-3 mr-1' /> {challenge.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col space-y-2'>
                <div className='flex items-center'>
                  <Award className='h-4 w-4 mr-1 text-blue-600' />
                  <span className='text-sm text-gray-600'>{challenge.points} points</span>
                </div>
                <div className='flex items-center'>
                  <User className='h-4 w-4 mr-1 text-gray-600' />
                  <span className='text-sm text-gray-600'>
                    Created by {challenge.profiles.username}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant='link' asChild className='px-0'>
                <Link href={`/challenges/${challenge.id}`}>View Challenge →</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
