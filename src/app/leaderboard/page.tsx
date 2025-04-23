'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Profile, supabase } from '@/lib/supabase';
import { Medal, RefreshCw, ShieldCheck, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Leaderboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchProfiles = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('points', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      setLoading(false);
      return;
    }

    setProfiles(data as Profile[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfiles();
    setRefreshing(false);
  };

  const renderSkeletonLoader = () => (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Trophy className="h-8 w-8 mr-2 text-yellow-500" /> Leaderboard
        </h1>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Refresh leaderboard"
        >
          <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6">
            {renderSkeletonLoader()}
          </div>
        ) : profiles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {profiles.map((profile, index) => {
                  const isCurrentUser = user && user.id === profile.id;
                  
                  return (
                    <tr 
                      key={profile.id} 
                      className={isCurrentUser ? "bg-blue-50" : undefined}
                    >
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
                        {isCurrentUser ? (
                          <span className="font-semibold text-blue-600">{profile.username} (You)</span>
                        ) : (
                          profile.username
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center ${
                          profile.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : profile.role === 'contributor'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <ShieldCheck className="h-3 w-3 mr-1" /> {profile.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {profile.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}