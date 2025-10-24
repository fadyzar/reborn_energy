
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/api/entities';
import { UserAvatar } from '@/api/entities';
import { ItemBlueprint } from '@/api/entities';
import { UserInventory } from '@/api/entities';
import { Notification } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Loader2, Zap, Shield, Heart, Dumbbell, Replace, Users, User as UserIcon, Check, Gift, Footprints, Target, Upload
} from 'lucide-react';
import AttributeCard from '../components/gamification/AttributeCard';
import AvatarSelectionModal from '../components/gamification/AvatarSelectionModal';
import NoAvatars from '../components/gamification/NoAvatars';
import Inventory from '../components/gamification/Inventory';
import AvatarViewer3D from '../components/gamification/AvatarViewer3D';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

// רשימת האוואטרים המובנית והיציבה - URLs updated to working placeholders
const defaultAvatars = [
  // החלפת האוואטר הבעייתי באוואטר חדש עם תמונה רגילה ויציבה
  { id: 'kaelia-2d', name: 'Kaelia', gender: 'Female', thumbnail_url: 'https://imgcdn.stablediffusionweb.com/2025/3/23/dfa45d6f-a350-4504-a728-0104c86238c6.jpg' },
  { id: 'temp-male-1',   name: 'Titan',   gender: 'Male',   thumbnail_url: 'https://media.craiyon.com/2025-07-31/ExjQud6RQAqx0e2D2atIBQ.webp' },
  { id: 'temp-female-1', name: 'Valkyrie',gender: 'Female', thumbnail_url: 'https://imgcdn.stablediffusionweb.com/2024/11/3/727f0ed4-f01f-421d-a133-057f3d0c7a85.jpg' },
  { id: 'temp-male-2',   name: 'Blaze',   gender: 'Male',   thumbnail_url: 'https://images.stockcake.com/public/3/2/2/322bd585-b69e-4bde-b04e-11beab02e94e_large/powerful-anime-workout-stockcake.jpg' },
  { id: 'temp-male-3',   name: 'Shadow',  gender: 'Male',   thumbnail_url: 'https://images.stockcake.com/public/d/4/1/d4128c44-fade-49cb-a360-1ae2c771ad42_large/powerful-anime-trainer-stockcake.jpg' },
  { id: 'temp-female-3', name: 'Rogue',   gender: 'Female', thumbnail_url: 'https://image.cdn2.seaart.me/2023-12-16/clunmr94msbc73fgs5dg/82a4c476f759fee776b14e69992c594a6c4ff09e_high.webp' },
  { id: 'temp-male-4',   name: 'Goliath', gender: 'Male',   thumbnail_url: 'https://images.nightcafe.studio/ik-seo/jobs/CPXaBGQDb41plBi45cEz/CPXaBGQDb41plBi45cEz--1--ygln7/in-the-gym.jpg?tr=w-1600,c-at_max' },
  { id: 'temp-female-4', name: 'Seraph',  gender: 'Female', thumbnail_url: 'https://imgcdn.stablediffusionweb.com/2024/12/12/2b195553-2a08-46e3-ba9d-2309d7528c5a.jpg' },
  { id: 'temp-male-5', name: 'Wukong', gender: 'Male', thumbnail_url: 'https://i.pinimg.com/736x/1d/e0/ac/1de0ac8d56c42973070cee5177c31ba0.jpg' },
  { id: 'temp-female-5', name: 'Mystique', gender: 'Female', thumbnail_url: 'https://i.pinimg.com/236x/28/41/09/28410906b2cc2d372c087f7f66117258.jpg' },
  { id: 'temp-male-6', name: 'Ares', gender: 'Male', thumbnail_url: 'https://image.tensorartassets.com/cdn-cgi/image/anim=true,plain=false,w=2048,f=jpeg,q=85/posts/images/619724267386413610/c7ab0399-16d7-455e-b231-e9332a6280dd.jpg' },
  // { id: 'temp-female-6', name: 'Ember', gender: 'Female', thumbnail_url: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/605fbcf7-7496-4706-b4bf-e9c58404f195/dhb0uf9-f5249794-9911-4e0b-be0b-e353abca0735.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNjUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi82MDVmYmNmNy03NDk2LTQ3MDYtYjRiZi1lOWM1ODQwNGYxOTUvZGhiMHVmOS1mNTI0OTc5NC05OTExLTRlMGItYmUwYi1lMzUzYWJjYTA3MzUuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQifX0.Bg560Bmx6uW-KY4CI2r3Fvdhu18N3OHFnxymwCkINM' }, // Removed as requested
  { id: 'temp-male-7', name: 'Ryu', gender: 'Male', thumbnail_url: 'https://images.stockcake.com/public/5/d/f/5df2a1c7-b6ac-460a-a879-09738927224b_medium/powerful-anime-trainer-stockcake.jpg' },
  { id: 'temp-male-8', name: 'Jaxon', gender: 'Male', thumbnail_url: 'https://assets.promptbase.com/DALLE_IMAGES%2F3EBVxlmTihOhWfStroMXUTe41B82%2Fresized%2F1715609704311v_800x800.webp?alt=media&token=55d1a98a-5bfe-468b-8abb-41049d6b1857' },
  { id: 'temp-female-7', name: 'Cybera', gender: 'Female', thumbnail_url: 'https://media.craiyon.com/2025-08-21/CcKZDok_SHStkTqtjaHUyg.webp' },
  { id: 'temp-female-8', name: 'Luna', gender: 'Female', thumbnail_url: 'https://rapi.pixai.art/img/media/449773783248979547/orig' },
  { id: 'temp-male-9', name: 'Zenith', gender: 'Male', thumbnail_url: 'https://creator.nightcafe.studio/jobs/Ao3UUofTQWmgE1XBGGA3/Ao3UUofTQWmgE1XBGGA3--1--zs1y0.jpg' },
  { id: 'temp-male-10', name: 'Kenji', gender: 'Male', thumbnail_url: 'https://img.freepik.com/free-photo/portrait-anime-character-doing-fitness-exercising_23-2151666661.jpg?semt=ais_hybrid&w=740&q=80' },
  { id: 'temp-female-10', name: 'Asuna', gender: 'Female', thumbnail_url: 'https://i.pinimg.com/736x/cd/ea/50/cdea502d5697fc5ce46b35e5882e83cf.jpg' },
  { id: 'temp-female-11', name: 'Sakura', gender: 'Female', thumbnail_url: 'https://img.freepik.com/premium-photo/japanese-kawaii-gym-girl-anime-flair-meets-cartoon-workout-digital-art-piece_950157-1758.jpg' },
  { id: 'temp-female-12', name: 'Hinata', gender: 'Female', thumbnail_url: 'https://img.freepik.com/premium-photo/cartoon-gym-girl-japanese-kawaii-fitness-fun-with-anime-twist-digital-art_950157-1756.jpg' },
  { id: 'temp-male-11', name: 'Kaito', gender: 'Male', thumbnail_url: 'https://img.freepik.com/free-photo/portrait-anime-character-doing-fitness-exercising_23-2151666657.jpg?semt=ais_hybrid&w=740&q=80' },
  { id: 'temp-female-13', name: 'Yuki', gender: 'Female', thumbnail_url: 'https://image.cdn2.seaart.me/temp-convert-webp/png/2023-08-31/15832920990217221/3ba0fcaa74ac63d8be00dca7fdbd53737ddefeec_low.webp' },
  { id: 'temp-male-12', name: 'Haru', gender: 'Male', thumbnail_url: 'https://img.freepik.com/free-photo/portrait-anime-character-doing-fitness-exercising_23-2151666656.jpg' },
  { id: 'temp-female-14', name: 'Rin', gender: 'Female', thumbnail_url: 'https://image.cdn2.seaart.me/2024-02-28/cnfbqmle878c73btokf0/931de56496ae564dfebdacf8fad4770058158e2c_high.webp' },
  { id: 'temp-female-15', name: 'Mika', gender: 'Female', thumbnail_url: 'https://img.favpng.com/1/16/15/anime-taekwondo-girl-in-martial-arts-uniform-ready-F6X4XLr6.jpg' },
  { id: 'temp-male-13', name: 'Deku', gender: 'Male', thumbnail_url: 'https://preview.redd.it/deku-trains-for-plus-ultra-v0-22gib6azf74d1.jpeg?width=640&crop=smart&auto=webp&s=8a5f2724920e6498b8219b7a217173dd66c623fc' },
  { id: 'temp-male-14', name: 'Raiden', gender: 'Male', thumbnail_url: 'https://img.freepik.com/premium-photo/anime-character-body-builder_933329-4918.jpg' },
  { id: 'temp-male-15', name: 'Spike', gender: 'Male', thumbnail_url: 'https://img.freepik.com/free-photo/fit-cartoon-character-training_23-2151148936.jpg?semt=ais_hybrid&w=740&q=80' },
  { id: 'temp-male-16', name: 'Brock', gender: 'Male', thumbnail_url: 'https://img.freepik.com/premium-photo/drawing-man-lifting-weights-with-words-bodybuilder-it_1308175-246948.jpg' }
];

// פונקציות לחישוב רמות ו-XP
const xpToLevel = (xp) => Math.floor(Math.pow(xp / 100, 0.7)) + 1;
const levelToXp = (level) => Math.ceil(Math.pow(level - 1, 1 / 0.7) * 100);

const Aura = ({ color, blur, scale, opacity, duration }) => (
  <motion.div
    className={`absolute inset-0 rounded-full ${color}`}
    style={{ filter: `blur(${blur})` }}
    animate={{ 
      scale: [scale, scale * 1.1, scale],
      opacity: [opacity, opacity * 0.8, opacity]
    }}
    transition={{ duration, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
  />
);

export default function AvatarHub() {
  const [user, setUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [avatars] = useState(defaultAvatars);
  const [inventory, setInventory] = useState([]);
  const [itemBlueprints, setItemBlueprints] = useState([]);
  const [dailyRewardAvailable, setDailyRewardAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const loadGameData = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const today = format(new Date(), 'yyyy-MM-dd');
      if (!currentUser.last_daily_reward_claim || currentUser.last_daily_reward_claim < today) {
        setDailyRewardAvailable(true);
      }

      // Fetch only data relevant to the current user
      const [userAvatarData, initialInventoryData, blueprintsData] = await Promise.all([
        UserAvatar.filter({ user_id: currentUser.id }),
        UserInventory.filter({ user_id: currentUser.id }),
        ItemBlueprint.list(),
      ]);
      
      setItemBlueprints(blueprintsData);

      // --- Grant new items one-time ---
      const oneTimeGrantItems = [
        "תיבת אוצר עתיקה", "תיבה אגדית", "Elixir of Giants", "Boots of Hermes",
        "Belt of Stability", "Essence of the Marathoner", "Tome of Iron Will",
        "Dew of Yggdrasil", "Crystal of Power", "Crate of Heroes",
        "Golden Apple", "Chalice of Ascension"
      ];
      let inventoryNeedsRefresh = false;

      for (const itemName of oneTimeGrantItems) {
        const blueprint = blueprintsData.find(bp => bp.name.includes(itemName));
        if (blueprint && !initialInventoryData.some(inv => inv.item_blueprint_id === blueprint.id)) {
          await UserInventory.create({ user_id: currentUser.id, item_blueprint_id: blueprint.id, quantity: 1 });
          inventoryNeedsRefresh = true;
        }
      }

      const userInventoryData = inventoryNeedsRefresh ? await UserInventory.filter({ user_id: currentUser.id }) : initialInventoryData;
      // --- End one-time grant ---
      
      if (userAvatarData.length > 0) {
        const savedAvatar = userAvatarData[0];
        if (savedAvatar.avatar_id === 'custom') {
            setUserAvatar({
                ...savedAvatar,
                name: 'אוואטר מותאם אישית',
                thumbnail_url: currentUser.profile_image_url,
                level: xpToLevel(savedAvatar.total_xp || 0)
            });
        } else {
            const selectedDefaultAvatar = defaultAvatars.find(a => a.id === savedAvatar.avatar_id);
            if (selectedDefaultAvatar) {
              setUserAvatar({ 
                ...savedAvatar, 
                ...selectedDefaultAvatar, 
                level: xpToLevel(savedAvatar.total_xp || 0) 
              });
            } else {
              setUserAvatar(null); // Invalid avatar, force re-selection
            }
        }
      } else {
        setUserAvatar(null); // No avatar selected yet
      }

      const populatedInventory = userInventoryData.map(invItem => ({
        ...invItem,
        blueprint: blueprintsData.find(bp => bp.id === invItem.item_blueprint_id)
      })).filter(item => item.blueprint);
      setInventory(populatedInventory);

    } catch (error) {
      console.error('Error loading game data:', error);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    loadGameData();
  }, []);

  const handleSelectAvatar = async (avatarId) => {
    if (!user) return;
    try {
      // Clear custom image if a default avatar is selected
      await User.updateMyUserData({ profile_image_url: null });

      const recs = await UserAvatar.filter({ user_id: user.id });
      if (recs.length > 0) {
        await UserAvatar.update(recs[0].id, { avatar_id: avatarId });
      } else {
        await UserAvatar.create({ 
            user_id: user.id, 
            avatar_id: avatarId, 
            total_xp: 0, 
            level: 1, 
            upper_body_xp: 0, 
            lower_body_xp: 0, 
            core_xp: 0, 
            endurance_xp: 0, 
            discipline_xp: 0, 
            vitality_xp: 0 
        });
      }
      window.location.reload();
    } catch (e) {
      console.error('Error selecting avatar:', e);
    }
  };

  const handleCustomImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
        const { file_url } = await UploadFile({ file });
        await User.updateMyUserData({ profile_image_url: file_url });

        const recs = await UserAvatar.filter({ user_id: user.id });
        if (recs.length > 0) {
            await UserAvatar.update(recs[0].id, { avatar_id: 'custom' });
        } else {
            await UserAvatar.create({
                user_id: user.id, avatar_id: 'custom',
                total_xp: 0, level: 1,
                upper_body_xp: 0, lower_body_xp: 0, core_xp: 0,
                endurance_xp: 0, discipline_xp: 0, vitality_xp: 0,
            });
        }
        toast.success("תמונת הפרופיל עודכנה בהצלחה!");
        window.location.reload();
    } catch (err) {
        console.error("Upload error:", err);
        toast.error("שגיאה בהעלאת התמונה.");
    }
    setUploading(false);
  };
  
  const handleClaimDailyReward = async () => {
    if (!dailyRewardAvailable || !user) return;
    
    try {
      const randomBlueprint = itemBlueprints[Math.floor(Math.random() * itemBlueprints.length)];
      if (!randomBlueprint) {
        toast.error("שגיאה בקבלת הפרס. נסה שוב מאוחר יותר.");
        return;
      }
      
      const existingItem = await UserInventory.filter({ user_id: user.id, item_blueprint_id: randomBlueprint.id });

      if (existingItem.length > 0) {
        await UserInventory.update(existingItem[0].id, { quantity: existingItem[0].quantity + 1 });
      } else {
        await UserInventory.create({ user_id: user.id, item_blueprint_id: randomBlueprint.id, quantity: 1 });
      }

      await User.updateMyUserData({ last_daily_reward_claim: format(new Date(), 'yyyy-MM-dd') });
      
      toast.success(`🎉 קיבלת פרס: ${randomBlueprint.name}!`);
      setDailyRewardAvailable(false);
      loadGameData();
    } catch(e) {
      console.error("Error claiming daily reward:", e);
      toast.error("שגיאה בקבלת הפרס.");
    }
  };
  
  const handleUseItem = async (item) => {
    if (!userAvatar || item.blueprint.effect_type !== 'INSTANT_XP') {
      toast.info("לא ניתן להשתמש בפריט זה כעת.");
      return;
    }
    
    try {
      const { attribute, value } = item.blueprint.effect_details;
      if (!attribute || value === undefined) {
          toast.error("שגיאה: פרטי הפריט אינם מלאים.");
          return;
      }

      const updateData = {};
      const newTotalXp = (userAvatar.total_xp || 0) + value;

      // If the attribute is not total_xp, update it separately
      if (attribute !== 'total_xp') {
        const currentAttributeXp = userAvatar[attribute] || 0;
        updateData[attribute] = currentAttributeXp + value;
      }

      updateData.total_xp = newTotalXp;
      updateData.level = xpToLevel(newTotalXp);
      
      await UserAvatar.update(userAvatar.id, updateData);
      
      if (item.quantity > 1) {
        await UserInventory.update(item.id, { quantity: item.quantity - 1 });
      } else {
        await UserInventory.delete(item.id);
      }
      
      toast.success(`🚀 השתמשת ב${item.blueprint.name}! +${value} ${attribute.replace('_xp', '')} XP`);
      loadGameData();
      
    } catch (e) {
      console.error("Error using item:", e);
      toast.error("שגיאה בשימוש בפריט.");
    }
  };
  
  const filteredAvatars = avatars.filter(a => (filter === 'All' ? true : a.gender === filter));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  // מסך בחירת אוואטר
  if (!userAvatar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-blue-950 text-white p-4 sm:p-8">
        <input type="file" ref={fileInputRef} onChange={handleCustomImageUpload} style={{ display: 'none' }} accept="image/*" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              בחר את האוואטר שלך
            </h1>
            <p className="text-gray-300 text-lg">הדמות שתייצג אותך בזירת ההתעלות.</p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            <Button variant={filter === 'All' ? 'default' : 'outline'} onClick={() => setFilter('All')} className="border-purple-500 text-purple-300 hover:bg-purple-700/30">
              <Users className="w-4 h-4 ml-2" /> הכל
            </Button>
            <Button variant={filter === 'Male' ? 'default' : 'outline'} onClick={() => setFilter('Male')} className="border-purple-500 text-purple-300 hover:bg-purple-700/30">
              <UserIcon className="w-4 h-4 ml-2" /> זכר
            </Button>
            <Button variant={filter === 'Female' ? 'default' : 'outline'} onClick={() => setFilter('Female')} className="border-purple-500 text-purple-300 hover:bg-purple-700/30">
              <UserIcon className="w-4 h-4 ml-2" /> נקבה
            </Button>
          </div>

          {filteredAvatars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card
                  className="bg-gray-800/60 backdrop-blur-sm border border-dashed border-purple-500 cursor-pointer hover:border-purple-400 transition-all duration-300 hover:scale-102 flex flex-col items-center justify-center text-center"
                  onClick={() => !uploading && fileInputRef.current.click()}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  {uploading ? (
                      <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                  ) : (
                      <Upload className="w-12 h-12 text-purple-400 mb-4" />
                  )}
                  <h2 className="text-xl font-bold text-white mb-2">העלה תמונה משלך</h2>
                  <p className="text-gray-400 text-sm">הפוך את עצמך לאוואטר</p>
                </CardContent>
              </Card>

              {filteredAvatars.map((avatar) => (
                <Card 
                  key={avatar.id} 
                  className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 cursor-pointer hover:border-purple-500 transition-all duration-300 hover:scale-102 hover:shadow-xl hover:shadow-purple-500/20" 
                  onClick={() => handleSelectAvatar(avatar.id)}
                >
                  <CardContent className="p-4 text-center">
                    <img
                      src={avatar.thumbnail_url}
                      alt={avatar.name}
                      className="w-full h-auto rounded-md mb-4 aspect-square object-cover shadow-lg"
                    />
                    <h2 className="text-xl font-bold text-white mb-4">{avatar.name}</h2>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-xl transition-all">
                      <Check className="w-4 h-4 ml-2" />
                      בחר את {avatar.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <NoAvatars />
          )}
        </div>
      </div>
    );
  }

  // מסך המשחק הראשי
  const totalXp = userAvatar.total_xp || 0;
  const currentLevel = userAvatar.level || 1;
  
  const upperBodyLevel = xpToLevel(userAvatar.upper_body_xp || 0);
  const lowerBodyLevel = xpToLevel(userAvatar.lower_body_xp || 0);
  const coreLevel = xpToLevel(userAvatar.core_xp || 0);

  return (
    <>
      <AvatarSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        avatars={avatars}
        onSelect={handleSelectAvatar}
        currentAvatarId={userAvatar.avatar_id}
        onUploadRequest={() => fileInputRef.current.click()}
        isUploading={uploading}
      />
      <input type="file" ref={fileInputRef} onChange={handleCustomImageUpload} style={{ display: 'none' }} accept="image/*" />
      <div className="min-h-screen bg-gray-900 text-white overflow-hidden relative font-sans">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-950/70 to-black z-0">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        </div>
        
        <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 h-full min-h-screen p-4 sm:p-6 lg:p-8 gap-6">
          {/* פאנל שמאלי: סטטיסטיקות - סדר 2 במובייל, 1 בדסקטופ */}
          <motion.div
            className="lg:col-span-3 space-y-4 order-2 lg:order-1 overflow-y-auto rounded-xl bg-black/30 backdrop-blur-lg border border-purple-500/20 shadow-2xl shadow-purple-500/10 p-4 h-full"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-center text-gray-300 tracking-wider">תכונות</h2>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild><div tabIndex="0"><AttributeCard icon={Dumbbell} name="כוח עליון" level={upperBodyLevel} xp={userAvatar.upper_body_xp || 0} xpToNextLevel={levelToXp(upperBodyLevel + 1)} color="text-red-500" /></div></TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-purple-500">
                  <p>כוח הנמדד באימוני חזה, גב, כתפיים וידיים.<br/>מגביר את העוצמה הפיזית של האוואטר.</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild><div tabIndex="0"><AttributeCard icon={Footprints} name="כוח תחתון" level={lowerBodyLevel} xp={userAvatar.lower_body_xp || 0} xpToNextLevel={levelToXp(lowerBodyLevel + 1)} color="text-blue-500" /></div></TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-purple-500">
                  <p>כוח הנמדד באימוני רגליים.<br/>משפר את היציבות והכוח המתפרץ של האוואטר.</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild><div tabIndex="0"><AttributeCard icon={Target} name="כוח ליבה" level={coreLevel} xp={userAvatar.core_xp || 0} xpToNextLevel={levelToXp(coreLevel + 1)} color="text-yellow-500" /></div></TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-purple-500">
                  <p>כוח הנמדד באימוני בטן וליבה.<br/>מהווה את מרכז הכוח של האוואטר.</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild><div tabIndex="0"><AttributeCard icon={Zap} name="סיבולת" level={xpToLevel(userAvatar.endurance_xp || 0)} xp={userAvatar.endurance_xp || 0} xpToNextLevel={levelToXp(xpToLevel(userAvatar.endurance_xp || 0) + 1)} color="text-teal-500" /></div></TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-purple-500">
                   <p>נבנה מאימוני אירובי וממשקל וחזרות באימוני כוח.<br/>קובע כמה זמן האוואטר יכול להחזיק במאמץ מתמשך.</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild><div tabIndex="0"><AttributeCard icon={Shield} name="משמעת" level={xpToLevel(userAvatar.discipline_xp || 0)} xp={userAvatar.discipline_xp || 0} xpToNextLevel={levelToXp(xpToLevel(userAvatar.discipline_xp || 0) + 1)} color="text-indigo-500" /></div></TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-purple-500">
                   <p>נצבר מעצם ההתמדה (3 אימונים בשבוע).<br/>משקף את החוזק המנטלי שלך.</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild><div tabIndex="0"><AttributeCard icon={Heart} name="חיוניות" level={xpToLevel(userAvatar.vitality_xp || 0)} xp={userAvatar.vitality_xp || 0} xpToNextLevel={levelToXp(xpToLevel(userAvatar.vitality_xp || 0) + 1)} color="text-green-500" /></div></TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-purple-500">
                  <p>מושפע מביצוע פעולות בריאות באופן כללי.<br/>קובע את יכולת ההתאוששות והחיוניות הכללית.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>

          {/* תצוגת האוואטר (אמצע) - סדר 1 במובייל, 2 בדסקטופ */}
          <div className="lg:col-span-6 h-auto lg:h-full w-full flex flex-col items-center justify-center pt-8 pb-4 order-1 lg:order-2">
            {/* Level & XP Bar */}
            <div className="text-center mb-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Level {currentLevel}
              </h1>
              <p className="text-gray-400 text-lg">Total XP: {totalXp}</p>
            </div>

            {/* Avatar */}
            <div className="relative w-full flex-1 flex justify-center items-center min-h-[50vh]" key={userAvatar.id}>
              {/* בדיקה אם לאוואטר יש מודל תלת-ממד */}
              {userAvatar.model_url ? (
                <AvatarViewer3D modelUrl={userAvatar.model_url} />
              ) : (
                <>
                  {/* Auras - נשאיר אותן לתמונות הדו-ממדיות */}
                  {upperBodyLevel >= 10 && <Aura color="from-red-500/70 to-transparent" blur="60px" scale={0.8} opacity={0.6} duration={5} />}
                  {lowerBodyLevel >= 10 && <Aura color="from-blue-500/70 to-transparent" blur="70px" scale={0.9} opacity={0.5} duration={6} />}
                  {coreLevel >= 10 && <Aura color="from-yellow-500/60 to-transparent" blur="80px" scale={1.0} opacity={0.4} duration={7} />}

                  {/* Character Image */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                        opacity: 1, 
                        y: 0,
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 max-h-[80vh] w-auto"
                  >
                    <motion.img
                      src={userAvatar.thumbnail_url}
                      alt={userAvatar.name || 'avatar'}
                      className="max-h-[80vh] w-auto object-contain drop-shadow-[0_20px_60px_rgba(138,43,226,0.5)] filter brightness-110 saturate-110"
                      animate={{ y: ["-2%", "2%"], rotateY: [-3, 3] }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>

                  {/* Floor/Podium effect */}
                  <div className="absolute bottom-0 h-1/3 w-full perspective-[500px] pointer-events-none">
                    <motion.div 
                      className="absolute inset-0"
                      initial={{ opacity: 0}}
                      animate={{ opacity: 1}}
                      transition={{ delay: 0.5, duration: 1 }}
                    >
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent" />
                      <div 
                        className="absolute bottom-[-50%] left-1/2 -translate-x-1/2 w-[150%] h-[100%] 
                                   bg-radial-gradient from-purple-500/30 via-purple-500/10 to-transparent rounded-[50%]"
                      />
                    </motion.div>
                  </div>
                </>
              )}
            </div>
            <Button
              variant="outline"
              className="mt-4 bg-black/30 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
              onClick={() => setIsModalOpen(true)}
            >
              <Replace className="w-4 h-4 ml-2" />
              שנה אוואטר
            </Button>
          </div>
          
          {/* פאנל ימני: תיק ופרסים - סדר 3 תמיד */}
          <motion.div
            className="lg:col-span-3 space-y-4 order-3 overflow-y-auto rounded-xl bg-black/30 backdrop-blur-lg border border-purple-500/20 shadow-2xl shadow-purple-500/10 p-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {dailyRewardAvailable && (
              <Card className="bg-gradient-to-r from-yellow-400/80 to-orange-500/80 border-yellow-300/50 text-white text-center shadow-lg shadow-yellow-500/30 transition-transform hover:scale-105 duration-300">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">פרס יומי מחכה לך!</h3>
                  <p className="mb-4">אסוף את הפרס היומי שלך כדי להתקדם במשחק.</p>
                  <Button className="w-full bg-white text-orange-600 font-bold hover:bg-yellow-100 shadow-md hover:shadow-xl transition-all" onClick={handleClaimDailyReward}>
                    <Gift className="w-5 h-5 ml-2 animate-bounce" />
                    קבל פרס
                  </Button>
                </CardContent>
              </Card>
            )}
            <Inventory items={inventory} onUseItem={handleUseItem} onGiftItem={() => toast.info("בקרוב: שלח מתנה לחבר!")} userLevel={currentLevel} />
          </motion.div>

        </main>
      </div>
    </>
  );
}
