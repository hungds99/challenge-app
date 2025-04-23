'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Challenge, Submission } from '@/lib/supabase';

export default function ReviewPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<(Submission & { challenge: Challenge })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    async function fetchSubmissions() {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          challenge:challenges(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching submissions:', error);
        return;
      }

      setSubmissions(data as (Submission & { challenge: Challenge })[]);
      setLoading(false);
    }

    fetchSubmissions();
  }, [user?.role]);

  const handleReview = async (submissionId: string, status: 'approved' | 'rejected', score: number) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status, score })
        .eq('id', submissionId);

      if (error) throw error;

      // Update user's points if approved
      if (status === 'approved') {
        const submission = submissions.find((s) => s.id === submissionId);
        if (submission) {
          const { error: updateError } = await supabase.rpc('increment_user_points', {
            user_id: submission.user_id,
            points: score,
          });

          if (updateError) throw updateError;
        }
      }

      // Remove the reviewed submission from the list
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    } catch (error) {
      console.error('Error reviewing submission:', error);
    }
  };

  if (user?.role !== 'admin') {
    return <div>Unauthorized</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Review Submissions</h1>

      {submissions.length === 0 ? (
        <p className="text-gray-500">No pending submissions to review.</p>
      ) : (
        <div className="space-y-6">
          {submissions.map((submission) => (
            <div key={submission.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {submission.challenge.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Submitted by: {submission.user_id}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  submission.challenge.difficulty === 'easy'
                    ? 'bg-green-100 text-green-800'
                    : submission.challenge.difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {submission.challenge.difficulty}
                </span>
              </div>

              <div className="prose max-w-none mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Solution</h3>
                <p className="mt-2 text-gray-600 whitespace-pre-wrap">
                  {submission.answer}
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleReview(submission.id, 'rejected', 0)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleReview(submission.id, 'approved', 100)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 