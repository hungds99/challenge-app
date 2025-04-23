'use client';

import ChallengeForm from '@/components/ChallengeForm';

export default function EditChallengePage({ params }: { params: { id: string } }) {
  return <ChallengeForm mode="edit" challengeId={params.id} />;
} 