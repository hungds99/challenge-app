'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Challenge, Profile, Submission, supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react';

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
          .select(`
            *,
            user_profile:profiles(id, username, role)
          `)
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

  const handleReviewSubmission = async (submissionId: string, status: 'approved' | 'rejected', points: number) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ 
          status: status,
          points: status === 'approved' ? points : 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      // If approved, update the user's total points
      if (status === 'approved' && points > 0) {
        const submission = submissions.find(s => s.id === submissionId);
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
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
            
          if (updateError) throw updateError;
        }
      }

      // Update local state to reflect changes
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => 
          sub.id === submissionId 
            ? { 
                ...sub, 
                status, 
                points: status === 'approved' ? points : 0 
              } 
            : sub
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submission');
    }
  };

  if (authLoading || loading) {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link href={`/challenges/${id}`} className="text-indigo-600 hover:text-indigo-800 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to challenge
        </Link>
      </div>
    );
  }

  if (!challenge) {
    return <div className="max-w-4xl mx-auto p-6">Challenge not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Submissions for: {challenge.title}</h1>
        <Link href={`/challenges/${id}`} className="text-indigo-600 hover:text-indigo-800 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to challenge
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-500">No submissions for this challenge yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{submission.user_profile.username}</p>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(submission.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center">
                  {submission.status === 'approved' ? (
                    <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-800 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" /> Approved
                    </span>
                  ) : submission.status === 'rejected' ? (
                    <span className="px-2 py-1 text-sm rounded-full bg-red-100 text-red-800 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" /> Rejected
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                      <Clock className="h-4 w-4 mr-1" /> Pending
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-gray-50 rounded border">
                <h3 className="text-sm font-semibold mb-1">Answer:</h3>
                <p>{submission.answer}</p>
              </div>
              
              {submission.status === 'approved' && (
                <div className="mt-2 flex items-center">
                  <span className="font-medium text-green-600">Points awarded: {submission.points}</span>
                </div>
              )}
              
              {submission.status === 'pending' && (profile?.role === 'admin' || profile?.role === 'contributor') && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleReviewSubmission(submission.id, 'approved', challenge.points)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" /> Approve ({challenge.points} points)
                  </button>
                  <button
                    onClick={() => handleReviewSubmission(submission.id, 'rejected', 0)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" /> Reject
                  </button>
                  
                  {/* Allow admin to give custom points */}
                  {profile?.role === 'admin' && (
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          const customPoints = prompt('Enter custom points:', String(challenge.points));
                          if (customPoints !== null) {
                            const points = parseInt(customPoints, 10);
                            if (!isNaN(points) && points >= 0) {
                              handleReviewSubmission(submission.id, 'approved', points);
                            }
                          }
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Custom Points
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}