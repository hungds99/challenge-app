'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import MarkdownEditor from '@/components/MarkdownEditor';

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
    expected_answers: [''],
    explanation: '',
    created_by: '',
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
        expected_answers: formData.expected_answers?.filter(answer => answer.trim() !== '') || null,
        explanation: formData.explanation,
        created_by: user.id,
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {mode === 'create' ? 'Create Challenge' : 'Edit Challenge'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="mt-1">
            <MarkdownEditor
              value={formData.description}
              onChange={handleDescriptionChange}
              height={300}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Answers (leave empty for manual verification)
          </label>
          <div className="space-y-2">
            {formData.expected_answers?.map((answer, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => handleExpectedAnswerChange(index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter an expected answer"
                />
                <button
                  type="button"
                  onClick={() => removeExpectedAnswer(index)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addExpectedAnswer}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              + Add Another Answer
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="explanation" className="block text-sm font-medium text-gray-700">
            Explanation
          </label>
          <div className="mt-1">
            <MarkdownEditor
              value={formData.explanation}
              onChange={handleExplanationChange}
              height={200}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
              Difficulty
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label htmlFor="points" className="block text-sm font-medium text-gray-700">
              Points
            </label>
            <input
              type="number"
              id="points"
              name="points"
              value={formData.points}
              onChange={handleChange}
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push(mode === 'create' ? '/challenges' : `/challenges/${challengeId}`)}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? 'Create Challenge' : 'Save Changes')}
          </button>
        </div>
      </form>
    </div>
  );
} 