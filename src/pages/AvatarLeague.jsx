
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/api/entities';
import { UserAvatar } from '@/api/entities';
import { Loader2, Users, Trophy } from 'lucide-react';
import AvatarLeagueCard from '../components/gamification/AvatarLeagueCard';

const defaultAvatars = [
  { id: 'temp-male-1', name: 'Titan', gender: 'Male', thumbnail_url: 'https://picsum.photos/seed/male_avatar_1/400/600' },
  { id: 'temp-female-1', name: 'Valkyrie', gender: 'Female', thumbnail_url: 'https://discover.therookies.co/content/images/size/w1000/2024/05/01MisatoRender01-IvanHo.jpg' },
  { id: 'temp-male-2', name: 'Blaze', gender: 'Male', thumbnail_url: 'https://picsum.photos/seed/male_avatar_2/400/600' },
  { id: 'temp-female-2', name: 'Nova', gender: 'Female', thumbnail_url: 'https://w7.pngwing.com/pngs/211/606/png-transparent-character-game-model-sheet-japanese-cartoon-johannes-cabal-the-necromancer-game-3d-computer-graphics-fictional-character.png' },
  { id: 'temp-male-3', name: 'Shadow', gender: 'Male', thumbnail_url: 'https://picsum.photos/seed/male_avatar_3/400/600' },
  { id: 'temp-female-3', name: 'Rogue', gender: 'Female', thumbnail_url: 'https://picsum.photos/seed/female_avatar_3/400/600' },
  { id: 'temp-male-4', name: 'Goliath', gender: 'Male', thumbnail_url: 'https://picsum.photos/seed/male_avatar_4/400/600' },
  { id: 'temp-female-4', name: 'Seraph', gender: 'Female', thumbnail_url: 'https://picsum.photos/seed/female_avatar_4/400/600' }
];

export default function AvatarLeague() {
  const [user, setUser] = useState(null);
  const [traineesWithAvatars, setTraineesWithAvatars] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLeagueData = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const coachId = currentUser.is_coach ? currentUser.id : currentUser.coach_id;
      if (!coachId) {
        setLoading(false);
        return;
      }
      
      const [trainees, allUserAvatars] = await Promise.all([
        User.filter({ coach_id: coachId }),
        UserAvatar.list()
      ]);

      const traineesWithData = trainees
        .map(trainee => {
          const userAvatar = allUserAvatars.find(ua => ua.user_id === trainee.id);
          if (userAvatar) {
            // Find the avatar details from the hardcoded list
            const avatar = defaultAvatars.find(a => a.id === userAvatar.avatar_id);
            if (avatar) {
              return { ...trainee, userAvatar, avatar };
            }
          }
          return null;
        })
        .filter(Boolean) // Remove trainees without a valid, matching avatar
        .sort((a, b) => b.userAvatar.total_xp - a.userAvatar.total_xp); // Sort by XP

      setTraineesWithAvatars(traineesWithData);

    } catch (error) {
      console.error("Error loading league data:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLeagueData();
  }, [loadLeagueData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user || (!user.is_coach && user.role !== 'admin')) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
              <h1 className="text-xl">דף זה זמין למאמנים בלבד.</h1>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            ליגת האוואטרים
          </h1>
          <p className="text-gray-400 mt-2">לוח המובילים של המתאמנים שלך</p>
        </div>

        {traineesWithAvatars.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-lg">
            <Users className="w-20 h-20 mx-auto text-gray-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-300">הליגה עוד ריקה</h2>
            <p className="text-gray-400 mt-2">
              כשהמתאמנים שלך יצטרפו למשחק ויבחרו אוואטר, תראה אותם כאן.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {traineesWithAvatars.map((trainee, index) => (
              <AvatarLeagueCard key={trainee.id} trainee={trainee} rank={index + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
