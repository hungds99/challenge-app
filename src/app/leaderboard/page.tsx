'use client';

import { useState, useEffect } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { Medal, ShieldCheck, TrendingUp, Trophy, User } from 'lucide-react';

export default function Leaderboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      setProfiles(data as Profile[]);
      setLoading(false);
    }

    fetchProfiles();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
        <Trophy className="h-8 w-8 mr-2 text-yellow-500" /> Leaderboard
      </h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                <Medal className="h-4 w-4 mr-1" /> Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                <User className="h-4 w-4 mr-1" /> Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                <ShieldCheck className="h-4 w-4 mr-1" /> Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" /> Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {profiles.map((profile, index) => (
              <tr key={profile.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index === 0 ? (
                    <span className="flex items-center">
                      <Medal className="h-5 w-5 mr-1 text-yellow-500" /> 1
                    </span>
                  ) : index === 1 ? (
                    <span className="flex items-center">
                      <Medal className="h-5 w-5 mr-1 text-gray-400" /> 2
                    </span>
                  ) : index === 2 ? (
                    <span className="flex items-center">
                      <Medal className="h-5 w-5 mr-1 text-amber-700" /> 3
                    </span>
                  ) : (
                    index + 1
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {profile.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center ${
                    profile.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : profile.role === 'contributor'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <ShieldCheck className="h-3 w-3 mr-1" /> {profile.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 text-blue-500" /> {profile.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}