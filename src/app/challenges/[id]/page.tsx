'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import MarkdownEditor from '@/components/markdown-editor';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  expected_answers: string[] | null;
  explanation: string;
  created_by: string;
}

interface Submission {
  id: string;
  user_id: string;
  challenge_id: string;
  answer: string;
  is_correct: boolean | null;
  points_awarded: number | null;
  created_at: string;
}

export default function ChallengePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError('Failed to load challenge');

        // If no challenge, set a dummy challenge

        setChallenge({
          id: '1',
          title: 'No challenge found',
          description: 'No challenge found',
          difficulty: 'easy',
          points: 0,
          expected_answers: [],
          explanation: 'No challenge found',
          created_by: 'admin',
        });
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
          expected => expected.toLowerCase() === answer.toLowerCase().trim()
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
            is_correct: isCorrect,
            points_awarded: pointsAwarded,
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{challenge.title}</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <span className="px-2 py-1 text-sm rounded-full bg-gray-100">
            {challenge.difficulty}
          </span>
          <span className="px-2 py-1 text-sm rounded-full bg-gray-100">
            {challenge.points} points
          </span>
        </div>
        {user?.id === challenge.created_by && (
          <button
            onClick={() => router.push(`/challenges/${id}/edit`)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Challenge
          </button>
        )}
      </div>

      <div className="prose max-w-none mb-8">
        <MarkdownEditor
          value={challenge.description}
          onChange={() => {}}
          height={300}
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!submission ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
              Your Answer
            </label>
            <input
              type="text"
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Answer'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className={`p-4 rounded-md ${
            submission.is_correct === true 
              ? 'bg-green-100' 
              : submission.is_correct === false 
                ? 'bg-red-100' 
                : 'bg-yellow-100'
          }`}>
            <p className="font-medium">
              {submission.is_correct === true 
                ? 'Correct!'
                : submission.is_correct === false 
                  ? 'Incorrect'
                  : 'Pending Review'}
            </p>
            <p>Your answer: {submission.answer}</p>
            {submission.points_awarded !== null && (
              <p>Points awarded: {submission.points_awarded}</p>
            )}
          </div>

          {showExplanation && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Explanation</h2>
              <div className="prose max-w-none">
                <MarkdownEditor
                  value={challenge.explanation}
                  onChange={() => {}}
                  height={200}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 