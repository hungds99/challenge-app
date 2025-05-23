'use client';

import MarkdownEditor from '@/components/markdown-editor';
import { useAuth } from '@/contexts/AuthContext';
import { Challenge, supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

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
    created_by: user?.id || '',
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
        status: formData.status,
        expected_answers:
          formData.expected_answers?.filter((answer) => answer.trim() !== '') || null,
        explanation: formData.explanation,
        created_by: user.id,
        updated_at: new Date().toISOString(),
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
    <Card className='max-w-4xl mx-auto p-6'>
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
          <Label htmlFor='title' className='mb-1' required>
            Title
          </Label>
          <Input
            type='text'
            id='title'
            name='title'
            value={formData.title}
            onChange={handleChange}
            required
            placeholder='Enter an engaging title for your challenge'
            className='mt-1'
          />
        </div>

        <div className='bg-gray-50 p-4 rounded-lg'>
          <Label htmlFor='description' className='mb-1' required>
            Description
          </Label>
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
          <Label className='mb-2'>Expected Answers</Label>
          <p className='text-sm text-gray-500 mb-3'>
            Add one or more acceptable answers. Leave empty for challenges that require manual
            review.
          </p>
          <div className='space-y-3'>
            {formData.expected_answers?.map((answer, index) => (
              <div key={index} className='flex gap-2 items-center'>
                <div className='flex-1 relative'>
                  <Input
                    type='text'
                    value={answer}
                    onChange={(e) => handleExpectedAnswerChange(index, e.target.value)}
                    placeholder='Enter an expected answer'
                  />
                </div>
                <Button
                  type='button'
                  onClick={() => removeExpectedAnswer(index)}
                  variant='outline'
                  className='p-2 text-red-600 hover:text-red-800'
                  size='icon'
                >
                  <X className='h-5 w-5' />
                </Button>
              </div>
            ))}
            <Button
              type='button'
              onClick={addExpectedAnswer}
              variant='ghost'
              className='mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium'
            >
              <Plus className='h-5 w-5 mr-1' />
              Add Another Answer
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <Label htmlFor='difficulty' className='mb-1'>
              Difficulty Level
            </Label>
            <Select
              id='difficulty'
              name='difficulty'
              value={formData.difficulty}
              onChange={handleChange}
              className='mt-1 w-full'
            >
              <option value='easy'>Easy</option>
              <option value='medium'>Medium</option>
              <option value='hard'>Hard</option>
            </Select>
          </div>

          <div className='bg-gray-50 p-4 rounded-lg'>
            <Label htmlFor='points' className='mb-1' required>
              Points Value
            </Label>
            <div className='relative mt-1'>
              <Input
                type='number'
                id='points'
                name='points'
                value={formData.points}
                onChange={handleChange}
                min='1'
                max='100'
                required
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
          <Label htmlFor='status' className='mb-1'>
            Status
          </Label>
          <Select
            id='status'
            name='status'
            value={formData.status}
            onChange={handleChange}
            className='mt-1 w-full'
          >
            <option value='draft'>Draft</option>
            <option value='pending'>Pending Review</option>
            {user?.role === 'admin' && <option value='published'>Published</option>}
          </Select>
          <p className='mt-1 text-xs text-gray-500'>
            Draft: Work in progress, Pending: Ready for review, Published: Live on the platform
          </p>
        </div>

        <div className='bg-gray-50 p-4 rounded-lg'>
          <Label htmlFor='explanation' className='mb-1'>
            Explanation
          </Label>
          <p className='text-sm text-gray-500 mb-2'>
            Provide an explanation of the solution. This will be shown to users after they complete
            the challenge.
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
          <Button
            type='button'
            onClick={() =>
              router.push(mode === 'create' ? '/challenges' : `/challenges/${challengeId}`)
            }
            variant='outline'
            className='w-full sm:w-auto'
          >
            Cancel
          </Button>
          <Button type='submit' disabled={loading} variant='default' className='w-full sm:w-auto'>
            {loading ? (
              <span className='flex items-center justify-center'>
                <Loader2 className='animate-spin h-4 w-4 mr-2' />
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </span>
            ) : mode === 'create' ? (
              'Create'
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
