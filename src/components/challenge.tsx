'use client';

import MarkdownEditor from '@/components/markdown-editor';
import { useAuth } from '@/contexts/AuthContext';
import { Challenge, Submission, supabase } from '@/lib/supabase';
import { Award, CheckCircle, Clock, Edit, FileText, XCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export default function ChallengeDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Check if user is admin or contributor
  const isReviewer = profile?.role === 'admin' || profile?.role === 'contributor';

  useEffect(() => {
    const fetchChallenge = async () => {
      const { data, error } = await supabase.from('challenges').select('*').eq('id', id).single();

      if (error) {
        setError('Failed to load challenge');
        return;
      } else {
        setChallenge(data);
      }

      if (user) {
        const { data: submissionData } = await supabase
          .from('submissions')
          .select('*')
          .eq('challenge_id', id)
          .eq('user_id', user.id)
          .single();

        if (submissionData) {
          setSubmission(submissionData);
          setShowExplanation(true);
        }
      }
    };

    fetchChallenge();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !challenge) return;

    setLoading(true);
    setError(null);

    try {
      let isCorrect: boolean | null = null;
      let pointsAwarded: number | null = null;

      // If there are expected answers, check automatically
      if (challenge.expected_answers && challenge.expected_answers.length > 0) {
        isCorrect = challenge.expected_answers.some(
          (expected) => expected.toLowerCase() === answer.toLowerCase().trim(),
        );
        pointsAwarded = isCorrect ? challenge.points : 0;
      }

      const { data, error } = await supabase
        .from('submissions')
        .insert([
          {
            user_id: user.id,
            challenge_id: challenge.id,
            answer,
            status: isCorrect === true ? 'approved' : isCorrect === false ? 'rejected' : 'pending',
            points: pointsAwarded || 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSubmission(data);
      setShowExplanation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!challenge) {
    return <div>Loading...</div>;
  }

  return (
    <Card className='max-w-4xl mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-4'>{challenge.title}</h1>
      <div className='flex justify-between items-center mb-4'>
        <div className='flex gap-2'>
          <Badge variant='outline' className='flex items-center'>
            <Award className='h-4 w-4 mr-1' /> {challenge.difficulty}
          </Badge>
          <Badge variant='outline' className='flex items-center'>
            <Award className='h-4 w-4 mr-1' /> {challenge.points} points
          </Badge>
        </div>
        <div className='flex gap-2'>
          {/* Show submissions button for admins and contributors */}
          {isReviewer && (
            <Button
              onClick={() => router.push(`/challenges/${id}/submissions`)}
              variant='outline'
              size='sm'
              className='flex items-center'
            >
              <FileText className='h-4 w-4 mr-1' /> Review Submissions
            </Button>
          )}
          {user?.id === challenge.created_by && (
            <Button
              onClick={() => router.push(`/challenges/${id}/edit`)}
              variant='outline'
              size='sm'
              className='flex items-center'
            >
              <Edit className='h-4 w-4 mr-1' /> Edit Challenge
            </Button>
          )}
        </div>
      </div>

      <div className='prose max-w-none mb-8'>
        <MarkdownEditor value={challenge.description} height={500} preview='preview' hideToolbar />
      </div>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      {!submission ? (
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='answer' className='mb-1' required>
              Your Answer
            </Label>
            <Input
              type='text'
              id='answer'
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className='mt-1'
            />
          </div>
          <Button type='submit' disabled={loading} variant='default'>
            {loading ? 'Submitting...' : 'Submit Answer'}
          </Button>
        </form>
      ) : (
        <div className='space-y-4'>
          <div
            className={cn(
              'p-4 rounded-md',
              submission.status === 'approved'
                ? 'bg-green-100'
                : submission.status === 'rejected'
                ? 'bg-red-100'
                : 'bg-yellow-100',
            )}
          >
            <p className='font-medium flex items-center'>
              {submission.status === 'approved' ? (
                <>
                  <CheckCircle className='h-5 w-5 mr-2 text-green-600' /> Correct!
                </>
              ) : submission.status === 'rejected' ? (
                <>
                  <XCircle className='h-5 w-5 mr-2 text-red-600' /> Incorrect
                </>
              ) : (
                <>
                  <Clock className='h-5 w-5 mr-2 text-yellow-600' /> Pending Review
                </>
              )}
            </p>
            <p>Your answer: {submission.answer}</p>
            {submission.points > 0 && <p>Points awarded: {submission.points}</p>}
          </div>

          {showExplanation && (
            <div className='mt-8'>
              <h2 className='text-xl font-bold mb-4'>Explanation</h2>
              <div className='prose max-w-none'>
                <MarkdownEditor
                  value={challenge.explanation}
                  height={200}
                  preview='preview'
                  hideToolbar={true}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
