import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DEMO_MODE } from '../../demo-config.js';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  // Fallback for demo mode or missing user data
  const displayUser = user || {
    email: 'Loading...',
    name: 'Loading...'
  };

  return (
    <div className="animate-fade-in-up">
      <div className="w-full max-w-lg mx-auto bg-gradient-to-b from-white/10 via-black/60 to-black/90 border border-white/20 rounded-xl p-8 shadow-lg backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          My Profile
        </h2>
        <div className="space-y-4 text-lg">
          <div className="flex justify-between border-b border-gray-700/50 pb-2">
            <span className="font-semibold text-gray-300">Email:</span>
            <span className="text-white">{displayUser.email}</span>
          </div>
          <div className="flex justify-between border-b border-gray-700/50 pb-2">
            <span className="font-semibold text-gray-300">Username:</span>
            <span className="text-white">{displayUser.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-300">Plan:</span>
            <span className="text-white">{DEMO_MODE ? 'Demo' : 'Premium'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
