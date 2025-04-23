'use client';

import MarkdownEditor from '@/components/markdown-editor';
import { useAuth } from '@/contexts/AuthContext';
import { Challenge, supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ChallengeFormProps {
  challengeId?: string;
  mode: 'create' | 'edit';
}

export default function ChallengeForm({ challengeId, mode }: ChallengeFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Challenge>({
    id: '',
    title: '',
    description: '',
    difficulty: 'easy',
    points: 10,
    status: 'draft',
    expected_answers: [],
    explanation: '',
    created_by: user?.id || '', // Set created_by to the current user's ID
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  useEffect(() => {
    if (mode === 'edit' && challengeId) {
      const fetchChallenge = async () => {
        const { data, error } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .single();

        if (error) {
          setError('Failed to load challenge');
          return;
        }

        setFormData({
          ...data,
          expected_answers: data.expected_answers || [''],
        });
      };

      fetchChallenge();
    }
  }, [challengeId, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) throw new Error('You must be logged in');

      const challengeData = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        points: formData.points,
        status: formData.status, // Add status field
        expected_answers:
          formData.expected_answers?.filter((answer) => answer.trim() !== '') || null,
        explanation: formData.explanation,
        created_by: user.id,
        updated_at: new Date().toISOString() // Always update the timestamp
      };

      if (mode === 'create') {
        const { data, error } = await supabase
          .from('challenges')
          .insert([challengeData])
          .select()
          .single();

        if (error) throw error;
        router.push(`/challenges/${data.id}`);
      } else {
        const { error } = await supabase
          .from('challenges')
          .update(challengeData)
          .eq('id', challengeId)
          .eq('created_by', user.id);

        if (error) throw error;
        router.push(`/challenges/${challengeId}`);
      }
    } catch (err) {
      console.error('Error saving challenge:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value?: string) => {
    setFormData((prev) => ({ ...prev, description: value || '' }));
  };

  const handleExplanationChange = (value?: string) => {
    setFormData((prev) => ({ ...prev, explanation: value || '' }));
  };

  const handleExpectedAnswerChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newAnswers = [...(prev.expected_answers || [''])];
      newAnswers[index] = value;
      return { ...prev, expected_answers: newAnswers };
    });
  };

  const addExpectedAnswer = () => {
    setFormData((prev) => ({
      ...prev,
      expected_answers: [...(prev.expected_answers || ['']), ''],
    }));
  };

  const removeExpectedAnswer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      expected_answers: (prev.expected_answers || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white rounded-lg'>
      <h1 className='text-3xl font-bold mb-6 text-indigo-700 border-b pb-2'>
        {mode === 'create' ? 'Create Challenge' : 'Edit Challenge'}
      </h1>

      {error && (
        <div
          className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm'
          role='alert'
        >
          <p className='font-medium'>Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-8'>
        <div className='bg-gray-50 p-4 rounded-lg'>
          <label htmlFor='title' className='block text-sm font-semibold text-gray-700 mb-1'>
            Title
          </label>
          <input
            type='text'
            id='title'
            name='title'
            value={formData.title}
            onChange={handleChange}
            required
            placeholder='Enter an engaging title for your challenge'
            className='mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors'
          />
        </div>

        <div className='bg-gray-50 p-4 rounded-lg'>
          <label htmlFor='description' className='block text-sm font-semibold text-gray-700 mb-1'>
            Description
          </label>
          <p className='text-sm text-gray-500 mb-2'>
            Use Markdown to format your challenge description. Include clear instructions and any
            necessary context.
          </p>
          <div className='mt-1'>
            <MarkdownEditor
              value={formData.description}
              onChange={handleDescriptionChange}
              height={300}
            />
          </div>
        </div>

        <div className='bg-gray-50 p-4 rounded-lg'>
          <label className='block text-sm font-semibold text-gray-700 mb-2'>Expected Answers</label>
          <p className='text-sm text-gray-500 mb-3'>
            Add one or more acceptable answers. Leave empty for challenges that require manual
            review.
          </p>
          <div className='space-y-3'>
            {formData.expected_answers?.map((answer, index) => (
              <div key={index} className='flex gap-2 items-center'>
                <div className='flex-1 relative'>
                  <input
                    type='text'
                    value={answer}
                    onChange={(e) => handleExpectedAnswerChange(index, e.target.value)}
                    className='w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors'
                    placeholder='Enter an expected answer'
                  />
                </div>
                <button
                  type='button'
                  onClick={() => removeExpectedAnswer(index)}
                  className='p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors'
                  aria-label='Remove answer'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type='button'
              onClick={addExpectedAnswer}
              className='mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-1'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z'
                  clipRule='evenodd'
                />
              </svg>
              Add Another Answer
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <label htmlFor='difficulty' className='block text-sm font-semibold text-gray-700 mb-1'>
              Difficulty Level
            </label>
            <select
              id='difficulty'
              name='difficulty'
              value={formData.difficulty}
              onChange={handleChange}
              className='mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 appearance-none bg-white transition-colors'
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
            >
              <option value='easy'>Easy</option>
              <option value='medium'>Medium</option>
              <option value='hard'>Hard</option>
            </select>
          </div>

          <div className='bg-gray-50 p-4 rounded-lg'>
            <label htmlFor='points' className='block text-sm font-semibold text-gray-700 mb-1'>
              Points Value
            </label>
            <div className='relative mt-1'>
              <input
                type='number'
                id='points'
                name='points'
                value={formData.points}
                onChange={handleChange}
                min='1'
                max='100'
                required
                className='block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors'
              />
              <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                <span className='text-gray-500'>pts</span>
              </div>
            </div>
            <p className='mt-1 text-xs text-gray-500'>
              Suggested: Easy (10-20), Medium (20-50), Hard (50-100)
            </p>
          </div>
        </div>

        <div className='bg-gray-50 p-4 rounded-lg'>
          <label htmlFor='status' className='block text-sm font-semibold text-gray-700 mb-1'>
            Status
          </label>
          <select
            id='status'
            name='status'
            value={formData.status}
            onChange={handleChange}
            className='mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 appearance-none bg-white transition-colors'
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem',
            }}
          >
            <option value='draft'>Draft</option>
            <option value='pending'>Pending Review</option>
            {user?.role === 'admin' && <option value='published'>Published</option>}
          </select>
          <p className='mt-1 text-xs text-gray-500'>
            Draft: Work in progress, Pending: Ready for review, Published: Live on the platform
          </p>
        </div>

        <div className='bg-gray-50 p-4 rounded-lg'>
          <label htmlFor='explanation' className='block text-sm font-semibold text-gray-700 mb-1'>
            Explanation
          </label>
          <p className='text-sm text-gray-500 mb-2'>
            Provide an explanation of the solution. This will be shown to users after they complete the challenge.
          </p>
          <div className='mt-1'>
            <MarkdownEditor
              value={formData.explanation}
              onChange={handleExplanationChange}
              height={200}
            />
          </div>
        </div>

        <div className='flex flex-col sm:flex-row justify-end gap-4 pt-4'>
          <button
            type='button'
            onClick={() =>
              router.push(mode === 'create' ? '/challenges' : `/challenges/${challengeId}`)
            }
            className='w-full sm:w-auto px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={loading}
            className='w-full sm:w-auto px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors'
          >
            {loading ? (
              <span className='flex items-center justify-center'>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </span>
            ) : mode === 'create' ? (
              'Create'
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
