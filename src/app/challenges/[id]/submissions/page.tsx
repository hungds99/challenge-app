'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Challenge, Profile, Submission, supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SubmissionsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<(Submission & { user_profile: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;

      if (!user || (profile?.role !== 'admin' && profile?.role !== 'contributor')) {
        router.push(`/challenges/${id}`);
        return;
      }

      try {
        setLoading(true);

        // Fetch challenge details
        const { data: challengeData, error: challengeError } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', id)
          .single();

        if (challengeError) {
          throw new Error('Failed to load challenge details');
        }

        setChallenge(challengeData);

        // Fetch all submissions for this challenge with user profiles
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select(
            `
            *,
            user_profile:profiles(id, username, role)
          `,
          )
          .eq('challenge_id', id)
          .order('created_at', { ascending: false });

        if (submissionsError) {
          throw new Error('Failed to load submissions');
        }

        setSubmissions(submissionsData as (Submission & { user_profile: Profile })[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, profile, authLoading, router]);

  const handleReviewSubmission = async (
    submissionId: string,
    status: 'approved' | 'rejected',
    points: number,
  ) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          status: status,
          points: status === 'approved' ? points : 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (error) throw error;

      // If approved, update the user's total points
      if (status === 'approved' && points > 0) {
        const submission = submissions.find((s) => s.id === submissionId);
        if (submission) {
          const userId = submission.user_id;

          // Get current user points
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('points')
            .eq('id', userId)
            .single();

          if (userError) throw userError;

          // Update user points
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              points: (userData.points || 0) + points,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (updateError) throw updateError;
        }
      }

      // Update local state to reflect changes
      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((sub) =>
          sub.id === submissionId
            ? {
                ...sub,
                status,
                points: status === 'approved' ? points : 0,
              }
            : sub,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submission');
    }
  };

  if (authLoading || loading) {
    return <div className='max-w-4xl mx-auto p-6'>Loading...</div>;
  }

  if (error) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
        <Link
          href={`/challenges/${id}`}
          className='text-indigo-600 hover:text-indigo-800 flex items-center'
        >
          <ArrowLeft className='h-4 w-4 mr-1' /> Back to challenge
        </Link>
      </div>
    );
  }

  if (!challenge) {
    return <div className='max-w-4xl mx-auto p-6'>Challenge not found</div>;
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold'>Submissions for: {challenge.title}</h1>
        <Button variant='outline' size='sm' asChild>
          <Link href={`/challenges/${id}`} className='flex items-center'>
            <ArrowLeft className='h-4 w-4 mr-1' /> Back to challenge
          </Link>
        </Button>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className='pt-6 text-center'>
            <p className='text-gray-500'>No submissions for this challenge yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader className='pb-2'>
                <div className='flex justify-between items-start'>
                  <div>
                    <p className='font-medium'>{submission.user_profile.username}</p>
                    <p className='text-sm text-gray-500'>
                      Submitted: {new Date(submission.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className='flex items-center'>
                    {submission.status === 'approved' ? (
                      <Badge variant='success' className='flex items-center'>
                        <CheckCircle className='h-3 w-3 mr-1' /> Approved
                      </Badge>
                    ) : submission.status === 'rejected' ? (
                      <Badge variant='destructive' className='flex items-center'>
                        <XCircle className='h-3 w-3 mr-1' /> Rejected
                      </Badge>
                    ) : (
                      <Badge variant='secondary' className='flex items-center'>
                        <Clock className='h-3 w-3 mr-1' /> Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className='mt-1 p-3 bg-gray-50 rounded border'>
                  <h3 className='text-sm font-semibold mb-1'>Answer:</h3>
                  <p>{submission.answer}</p>
                </div>

                {submission.status === 'approved' && (
                  <div className='mt-2 flex items-center'>
                    <Badge variant='outline' className='font-medium text-green-600'>
                      Points awarded: {submission.points}
                    </Badge>
                  </div>
                )}
              </CardContent>

              {submission.status === 'pending' &&
                (profile?.role === 'admin' || profile?.role === 'contributor') && (
                  <CardFooter className='flex gap-3'>
                    <Button
                      onClick={() =>
                        handleReviewSubmission(submission.id, 'approved', challenge.points)
                      }
                      variant='success'
                      size='sm'
                      className='bg-green-600 hover:bg-green-700'
                    >
                      <ThumbsUp className='h-4 w-4 mr-1' /> Approve ({challenge.points} points)
                    </Button>
                    <Button
                      onClick={() => handleReviewSubmission(submission.id, 'rejected', 0)}
                      variant='outline'
                      size='sm'
                    >
                      <ThumbsDown className='h-4 w-4 mr-1' /> Reject
                    </Button>

                    {/* Allow admin to give custom points */}
                    {profile?.role === 'admin' && (
                      <Button
                        onClick={() => {
                          const customPoints = prompt(
                            'Enter custom points:',
                            String(challenge.points),
                          );
                          if (customPoints !== null) {
                            const points = parseInt(customPoints, 10);
                            if (!isNaN(points) && points >= 0) {
                              handleReviewSubmission(submission.id, 'approved', points);
                            }
                          }
                        }}
                        variant='secondary'
                        size='sm'
                      >
                        Custom Points
                      </Button>
                    )}
                  </CardFooter>
                )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
