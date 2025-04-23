'use client';

import ChallengeForm from '@/components/challenge-form';

export default function EditChallengePage({ params }: { params: { id: string } }) {
  return <ChallengeForm mode="edit" challengeId={params.id} />;
} 