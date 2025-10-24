import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Crown, Dumbbell, Zap, Shield, Heart, Footprints, Target } from 'lucide-react';

const xpToLevel = (xp) => Math.floor(Math.pow((xp || 0) / 100, 0.7)) + 1;

const StatBar = ({ icon: Icon, value, color }) => (
  <div className="flex items-center gap-2">
    <Icon className={`w-4 h-4 ${color}`} />
    <span className="font-semibold text-sm">{value}</span>
  </div>
);

export default function AvatarLeagueCard({ trainee, rank }) {
  const { userAvatar, avatar, hebrew_name } = trainee;
  const level = xpToLevel(userAvatar.total_xp);

  const rankColor = rank === 1 ? 'border-yellow-400 bg-yellow-400/10' :
                    rank === 2 ? 'border-gray-400 bg-gray-400/10' :
                    rank === 3 ? 'border-amber-600 bg-amber-600/10' :
                    'border-gray-700 bg-gray-800/50';

  return (
    <Card className={`text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-purple-900/20 ${rankColor}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center flex-shrink-0">
            {rank === 1 && <Crown className="w-6 h-6 text-yellow-400 mb-1" />}
            <span className="text-3xl font-bold">{rank}</span>
          </div>
          
          <img src={avatar.thumbnail_url} alt={avatar.name} className="w-20 h-20 rounded-full border-2 border-purple-500 shadow-lg" />
          
          <div className="flex-grow">
            <h3 className="font-bold text-lg truncate">{hebrew_name}</h3>
            <p className="text-sm text-gray-400">{avatar.name}</p>
            <div className="mt-2">
              <Progress value={((userAvatar.total_xp || 0) % 100)} className="h-2" />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs font-bold text-purple-300">Level {level}</span>
                <span className="text-xs text-gray-400">{userAvatar.total_xp || 0} XP</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-gray-300">
          <StatBar icon={Dumbbell} value={xpToLevel(userAvatar.upper_body_xp)} color="text-red-400" />
          <StatBar icon={Footprints} value={xpToLevel(userAvatar.lower_body_xp)} color="text-blue-400" />
          <StatBar icon={Target} value={xpToLevel(userAvatar.core_xp)} color="text-yellow-400" />
          <StatBar icon={Zap} value={xpToLevel(userAvatar.endurance_xp)} color="text-teal-400" />
          <StatBar icon={Shield} value={xpToLevel(userAvatar.discipline_xp)} color="text-indigo-400" />
          <StatBar icon={Heart} value={xpToLevel(userAvatar.vitality_xp)} color="text-green-400" />
        </div>
      </CardContent>
    </Card>
  );
}