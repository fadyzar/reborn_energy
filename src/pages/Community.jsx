
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { Notification } from "@/api/entities";
import { CommunityPost } from "@/api/entities";
import { CommunityComment } from "@/api/entities";
import { CommunityChallenge } from "@/api/entities";
import { ChallengeParticipation } from "@/api/entities";
import { Group } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, Plus, Heart, MessageCircle, Trophy, Crown, Smile,
  Coffee, MessageSquare, Award, Filter
} from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import { createCoachNotification } from '@/components/lib/notifications'; // ייבוא הפונקציה

import JoinCommunity from "../components/community/JoinCommunity";
import ChallengeCard from "../components/community/ChallengeCard";
import ChallengeForm from "../components/community/ChallengeForm";
import CreatePostForm from "../components/community/CreatePostForm";
import CommunityPostComponent from "../components/community/CommunityPost";

const sampleChallengesToAdd = [
    {
        title: "אתגר 100 שכיבות סמיכה יומי",
        description: "בצעו 100 שכיבות סמיכה בכל יום, במשך שבוע! ניתן לחלק לאורך היום. המטרה: עקביות וכוח.",
        points_value: 75,
        challenge_type: "custom",
        goal_type: "custom",
        target_value: 1,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
        is_active: true
    },
    {
        title: "מפגש ריצה קהילתי",
        description: "ריצת 10 ק\"מ משותפת בחוף הים! הזדמנות לגיבוש וכיף. שלחו הודעה שהגעתם כהוכחה.",
        points_value: 50,
        challenge_type: "custom",
        goal_type: "custom",
        target_value: 1,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
        is_active: true
    },
    {
        title: "אתגר שני אימונים ביום",
        description: "לאמיצים בלבד! השלימו שני אימונים ביום (כוח + אירובי) במשך 3 ימים השבוע. כתבו כהוכחה מה היו האימונים.",
        points_value: 100,
        challenge_type: "custom",
        goal_type: "custom",
        target_value: 1,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
        is_active: true
    }
];

export default function Community() {
  const [user, setUser] = useState(null);
  const [communityMembers, setCommunityMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [challenges, setChallenges] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadCommunityData = useCallback(async (forceReload = false) => {
    if (!forceReload) setLoading(true);
    setError(null);

    try {
      console.log("Loading community data...");
      const currentUser = await User.me();
      console.log("Current user:", currentUser);
      setUser(currentUser);

      // מנהל רואה הכל
      if (currentUser.role === 'admin') {
        console.log("Loading data for admin - showing all communities");
        
        const [allUsers, allPosts, allChallenges, allParticipations, allGroups] = await Promise.all([
          User.list('-created_date', 500).catch(err => { console.log("Error loading all users:", err); return []; }),
          CommunityPost.list('-created_date', 100).catch(err => { console.log("Error loading all posts:", err); return []; }),
          CommunityChallenge.list('-created_date', 50).catch(err => { console.log("Error loading all challenges:", err); return []; }),
          ChallengeParticipation.list('-created_date', 200).catch(err => { console.log("Error loading all participations:", err); return []; }),
          Group.list().catch(err => { console.log("Error loading all groups:", err); return []; })
        ]);

        setCommunityMembers(allUsers.sort((a, b) => (b.points || 0) - (a.points || 0)));
        setPosts(allPosts);
        setChallenges(allChallenges);
        setParticipations(allParticipations);
        setGroups(allGroups);
        
        if (!forceReload) setLoading(false);
        return;
      }

      const coachId = currentUser.is_coach ? currentUser.id : currentUser.coach_id;
      console.log("Coach ID:", coachId);
      
      if (!coachId) {
        console.log("No coach ID found, checking if user needs to join community");
        if (!forceReload) setLoading(false);
        return;
      }
      
      // Determine filters based on user type (coach or trainee) and their group
      let postFilter = {};
      let challengeFilter = {};
      if (currentUser.is_coach) {
          postFilter = { coach_id: coachId };
          challengeFilter = { coach_id: coachId };
      } else {
          // Trainee must be assigned to a group to see community feed/challenges
          if (!currentUser.group_id) {
              setPosts([]);
              setChallenges([]);
              setParticipations([]);
              setCommunityMembers([]);
              if (!forceReload) setLoading(false);
              return;
          }
          postFilter = { group_id: currentUser.group_id };
          challengeFilter = { group_id: currentUser.group_id };
      }

      console.log("Loading community data for:", currentUser.is_coach ? "Coach" : "Trainee", "with filters:", {postFilter, challengeFilter});
      
      const [trainees, coachUserArray, postsData, challengesData, participationsData, coachGroups] = await Promise.all([
        User.filter({ coach_id: coachId }).catch(err => { console.log("Error loading trainees:", err); return []; }),
        User.filter({ id: coachId }).catch(err => { console.log("Error loading coach:", err); return []; }),
        CommunityPost.filter(postFilter, '-created_date', 50).catch(err => { console.log("Error loading posts:", err); return []; }),
        CommunityChallenge.filter(challengeFilter, '-created_date', 20).catch(err => { console.log("Error loading challenges:", err); return []; }),
        ChallengeParticipation.list('-created_date', 100).catch(err => { console.log("Error loading participations:", err); return []; }),
        currentUser.is_coach ? Group.filter({ coach_id: coachId }).catch(err => { console.log("Error loading groups:", err); return []; }) : Promise.resolve([])
      ]);
      
      console.log("Loaded data:", { trainees, coachUserArray, postsData, challengesData, participationsData, coachGroups });
      setGroups(coachGroups);
      
      const coachUser = coachUserArray.length > 0 ? coachUserArray[0] : null;
      const allCommunityMembers = coachUser ? [...trainees, coachUser] : [...trainees];
      
      const uniqueMembers = allCommunityMembers.filter((member, index, self) =>
        index === self.findIndex((m) => m.id === member.id)
      ).sort((a, b) => (b.points || 0) - (a.points || 0));
      
      console.log("Community members:", uniqueMembers);
      setCommunityMembers(uniqueMembers);
      
      console.log("Setting posts:", postsData);
      setPosts(postsData);
      
      console.log("Setting challenges:", challengesData);
      setChallenges(challengesData);

      const challengeIds = challengesData.map(c => c.id);
      const filteredParticipations = participationsData.filter(p => challengeIds.includes(p.challenge_id));
      console.log("Setting participations:", filteredParticipations);
      setParticipations(filteredParticipations);

    } catch (error) {
      console.error("Error loading community data:", error);
      setError("שגיאה בטעינת נתוני הקהילה. אנא נסה לרענן את הדף.");
    }
    
    if (!forceReload) setLoading(false);
  }, []);

  useEffect(() => {
    const initializeCommunity = async () => {
      console.log("Initializing community...");
      setLoading(true);
      try {
        const currentUser = await User.me();
        console.log("User loaded:", currentUser);
        setUser(currentUser);

        const coachId = currentUser.is_coach ? currentUser.id : currentUser.coach_id;
        if (!coachId && currentUser.role !== 'admin') { // Admins don't need a coachId
          console.log("No coach ID, user needs to join community");
          setLoading(false);
          return;
        }

        if (currentUser.is_coach || currentUser.role === 'admin') { // Admin can also create sample challenges
          const existingChallenges = await CommunityChallenge.filter({ coach_id: coachId || currentUser.id }); // If admin, use their own ID
          console.log("Existing challenges for coach:", existingChallenges);
          if (existingChallenges.length === 0) {
            console.log("Creating sample challenges for new coach/admin");
            for (const challenge of sampleChallengesToAdd) {
                await CommunityChallenge.create({...challenge, coach_id: coachId || currentUser.id});
            }
          }
        }
        
        await loadCommunityData(true);

      } catch (error) {
        console.error("Error initializing community:", error);
        setError("שגיאה באתחול הקהילה. אנא נסה לרענן את הדף.");
      }
      setLoading(false);
    };
    
    initializeCommunity();
  }, [loadCommunityData]);

  const sendNotification = async (title, content, type = 'general') => {
    if (!user || !communityMembers.length) return;

    // For admin, notifications are sent by the admin's ID.
    // For coach, by coach's ID. For trainee, by their coach's ID.
    const coachIdForNotification = user.role === 'admin' ? user.id : (user.is_coach ? user.id : user.coach_id);
    if (!coachIdForNotification) return;

    const notificationPromises = communityMembers
      .filter(member => member.id !== user.id)
      .map(member => Notification.create({
        user_id: member.id,
        coach_id: coachIdForNotification,
        title,
        content,
        type,
      }));
    try {
      await Promise.all(notificationPromises);
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  };

  const handleCreatePost = async (postData) => {
    if (!user) return;

    // מנהל יכול לפרסם פוסטים גם בלי להיות שויך לחוג
    if (!user.is_coach && !user.group_id && user.role !== 'admin') {
        alert("עליך להיות משויך לחוג כדי לפרסם פוסט.");
        return;
    }

    const author = communityMembers.find(m => m.id === user.id) || user;
    if (!author) {
        console.error("Could not find author details.");
        return;
    }

    // עבור מנהל או מאמן - נשתמש ב-ID שלו כ-coach_id
    const coachId = user.role === 'admin' ? user.id : (user.is_coach ? user.id : user.coach_id);
    if (!coachId) {
      console.error("Coach ID not found for current user.");
      return;
    }

    let groupId = postData.group_id;
    
    // If coach/admin but no specific group selected or no groups exist
    if (user.role === 'admin' || user.is_coach) {
      if (!groupId || groupId === '') {
        // Create default group if coach has no groups
        if (groups.length === 0 && user.is_coach) {
          try {
            const defaultGroup = await Group.create({
              name: "הקהילה שלי",
              description: "חוג כללי למתאמנים",
              coach_id: user.id
            });
            setGroups(prevGroups => [...prevGroups, defaultGroup]);
            groupId = defaultGroup.id;
          } catch (error) {
            console.error("Error creating default group:", error);
            // If group creation fails, still allow posting with null group for admin
            // This line ensures groupId is null if an error occurs during default group creation for a coach,
            // or if the user is an admin and no groups exist.
            groupId = null;
          }
        } else if (groups.length > 0) {
          // Use first available group
          groupId = groups[0].id;
        } else {
            // If no groups exist and it's not a coach (or default group creation failed), groupId remains null.
            // This applies to an admin who has no groups defined in the system.
            groupId = null;
        }
      }
    } else {
      // Regular trainee uses their assigned group
      groupId = user.group_id;
    }

    // Optimistic Update
    const tempId = `temp-${Date.now()}`;
    const optimisticPost = {
      ...postData,
      id: tempId,
      coach_id: coachId,
      group_id: groupId,
      user_id: user.id,
      author_hebrew_name: author.hebrew_name || author.full_name,
      author_is_coach: author.is_coach || user.role === 'admin', // מנהל נחשב כמאמן לצרכים אלו
      likes_count: 0,
      comments_count: 0,
      is_pinned: false,
      created_date: new Date().toISOString(),
    };

    setShowCreatePost(false);
    setPosts(prevPosts => [optimisticPost, ...prevPosts]);

    try {
      const newPost = await CommunityPost.create({
        ...postData,
        coach_id: coachId,
        group_id: groupId,
        user_id: user.id,
        author_hebrew_name: author.hebrew_name || author.full_name,
        author_is_coach: author.is_coach || user.role === 'admin',
        likes_count: 0,
        comments_count: 0,
        is_pinned: false,
      });
      
      setPosts(prevPosts => prevPosts.map(p => p.id === tempId ? newPost : p));
      
      await sendNotification('פוסט חדש בקהילה!', `מאת ${author.hebrew_name || author.full_name}: ${newPost.content.substring(0, 50)}...`);
      
    } catch (error) {
      console.error("Error creating post:", error);
      setPosts(prevPosts => prevPosts.filter(p => p.id !== tempId));
      setShowCreatePost(true);
    }
  };

  const handleSaveChallenge = async (challengeData) => {
    try {
      const coachId = user.role === 'admin' ? user.id : user.id; // מנהל יכול ליצור אתגרים
      if (!coachId || (!user.is_coach && user.role !== 'admin')) {
        console.error("Only coaches and admins can manage challenges.");
        return;
      }

      const dataToSave = { ...challengeData, coach_id: coachId };
      setShowChallengeForm(false);
      
      if (editingChallenge) {
        const savedChallenge = await CommunityChallenge.update(editingChallenge.id, dataToSave);
        setChallenges(prev => prev.map(c => c.id === savedChallenge.id ? savedChallenge : c));
      } else {
        const tempId = `temp-challenge-${Date.now()}`;
        const optimisticChallenge = { 
            ...dataToSave, 
            id: tempId, 
            created_date: new Date().toISOString() 
        };
        setChallenges(prev => [optimisticChallenge, ...prev]);
        setEditingChallenge(null);

        const savedChallenge = await CommunityChallenge.create(dataToSave);
        setChallenges(prev => prev.map(c => c.id === tempId ? savedChallenge : c));
        
        await sendNotification('אתגר חדש התחיל!', `שם האתגר: ${savedChallenge.title}`, 'new_challenge');
      }
      
      setEditingChallenge(null);

    } catch (error) {
      console.error("Error saving challenge:", error);
      await loadCommunityData(true);
    }
  };

  const handleToggleActive = async (challengeId, newActiveState) => {
    try {
      await CommunityChallenge.update(challengeId, { is_active: newActiveState });
      await loadCommunityData(true);
    } catch (error) {
      console.error("Error toggling challenge active state:", error);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    if (!user) return;

    const alreadyJoined = participations.some(p => p.challenge_id === challengeId && p.user_id === user.id);
    if (alreadyJoined) {
      console.log("User already joined this challenge.");
      return;
    }

    try {
        await ChallengeParticipation.create({ challenge_id: challengeId, user_id: user.id, status: 'in_progress' });
        
        // שליחת התראה למאמן
        const challenge = challenges.find(c => c.id === challengeId);
        if (challenge) {
            await createCoachNotification(
                user,
                "הצטרפות לאתגר",
                `${user.hebrew_name || user.full_name} הצטרף לאתגר: "${challenge.title}"`,
                "challenge_join"
            );
        }

        await loadCommunityData(true); // Force reload
    } catch (error) {
        console.error("Error joining challenge:", error);
    }
  };

  const handleSubmitProof = async (challengeId, proof) => {
    if (!user) return;
    const participation = participations.find(p => p.challenge_id === challengeId && p.user_id === user.id);
    if (participation) {
      try {
        await ChallengeParticipation.update(participation.id, { 
            proof_submission: proof, 
            status: 'pending_approval' 
        });

        // שליחת התראה למאמן
        const challenge = challenges.find(c => c.id === participation?.challenge_id);
        if (challenge) {
            await createCoachNotification(
                user,
                "הגשה לאישור באתגר",
                `${user.hebrew_name || user.full_name} הגיש הוכחה באתגר: "${challenge.title}"`,
                "challenge_submission"
            );
        }

        await loadCommunityData(true);
      } catch (error) {
        console.error("Error submitting proof:", error);
      }
    } else {
      console.warn("Participation not found for submitting proof.");
    }
  };

  const handleApproveSubmission = async (participation, isApproved) => {
    if (!user || (!user.is_coach && user.role !== 'admin')) { // Admin can also approve submissions
      console.error("Only coaches and admins can approve/reject submissions.");
      return;
    }
    
    try {
      const status = isApproved ? 'completed' : 'rejected';
      await ChallengeParticipation.update(participation.id, { status });

      if (isApproved) {
        const challenge = challenges.find(c => c.id === participation.challenge_id);
        const trainee = communityMembers.find(m => m.id === participation.user_id);
        
        if (challenge && trainee) {
          // הוספת נקודות למתאמן
          const newPoints = (trainee.points || 0) + (challenge.points_value || 0);
          await User.update(trainee.id, { points: newPoints });
          
          // שליחת התראת הישג
          await Notification.create({
            user_id: trainee.id,
            coach_id: user.role === 'admin' ? user.id : user.id, // Notification from admin or coach
            title: '🏆 כל הכבוד! האתגר הושלם בהצלחה!',
            content: `מעולה! השלמת בהצלחה אתגר "${challenge.title}" וזכית ב-${challenge.points_value} נקודות! 
            
🎯 פרטי האתגר:
• ${challenge.title}
• ${challenge.points_value} נקודות נוספו לחשבון שלך
• הנקודות הכוללות שלך עכשיו: ${newPoints}

💪 תמשיך כך! אתה בדרך הנכונה להשגת המטרות שלך.`,
            type: 'achievement',
          });
        }
      } else {
        // שליחת התראה על דחיה
        const challenge = challenges.find(c => c.id === participation.challenge_id);
        await Notification.create({
          user_id: participation.user_id,
          coach_id: user.role === 'admin' ? user.id : user.id, // Notification from admin or coach
          title: 'עדכון על האתגר שלך',
          content: `ההגשה שלך לאתגר "${challenge?.title}" נדחתה. 

💡 טיפים לשיפור:
• ודא שההוכחה ברורה ומפורטת
• הוסף תמונות או וידאו אם אפשר
• תאמן עם המאמן לקבלת הנחיות

🔄 תוכל לנסות שוב ולהגיש הוכחה חדשה!`,
          type: 'challenge_status',
        });
      }
      
      await loadCommunityData(true);
    } catch (error) {
      console.error("Error approving submission:", error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (post) {
        setPosts(prevPosts => prevPosts.map(p => 
          p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p
        ));

        await CommunityPost.update(postId, {
          likes_count: (post.likes_count || 0) + 1
        });
      }
    } catch (error) {
      console.error("Error liking post:", error);
      await loadCommunityData(true);
    }
  };
  
  const handleComment = async (postId, content) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (post) {
        const comment = await CommunityComment.create({
          post_id: postId,
          user_id: user.id,
          content,
        });

        // Optimistically update UI
        setCommentsByPost(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), { ...comment, author_name: user.hebrew_name || user.full_name }]
        }));
        setPosts(prevPosts => prevPosts.map(p => 
          p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
        ));
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      // Optional: rollback optimistic update on error by reloading comments for this post
      loadCommentsForPost(postId);
    }
  };

  const loadCommentsForPost = async (postId) => {
    if (commentsByPost[postId] && commentsByPost[postId].length > 0) return; // Already loaded

    try {
      const comments = await CommunityComment.filter({ post_id: postId }, '-created_date');
      // Enrich with author name
      const enrichedComments = comments.map(c => {
        const author = communityMembers.find(m => m.id === c.user_id);
        return { ...c, author_name: author?.hebrew_name || author?.full_name || 'משתמש' };
      });
      setCommentsByPost(prev => ({ ...prev, [postId]: enrichedComments }));
    } catch (error) {
      console.error(`Error loading comments for post ${postId}:`, error);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 text-xl">טוען את המשפחה שלנו...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">שגיאה בטעינת הקהילה</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>רענן דף</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">יש להתחבר למערכת</h2>
        <Button onClick={() => User.login()}>התחבר</Button>
      </div>
    );
  }

  // Admins are not subject to the join community flow
  if (!user.coach_id && !user.is_coach && user.role !== 'admin') {
    return <JoinCommunity onJoinSuccess={loadCommunityData} />;
  }

  // רק מתאמנים רגילים צריכים להיות משויכים לחוג
  if (!user.is_coach && user.role !== 'admin' && !user.group_id) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">עדיין לא שוייכת לחוג</h2>
            <p className="text-gray-600 text-center mb-6">הקהילה זמינה רק לאחר שהמאמן משייך אותך לחוג. אנא פנה למאמן שלך.</p>
        </div>
    );
  }

  const isCoach = user.is_coach || user.role === 'admin'; // מנהל נחשב כמאמן לצרכי הקהילה

  // Filter posts and challenges if the user is a coach/admin and a specific group is selected
  // Admin users, if they select 'all', see all posts/challenges. If they select a specific group, they see only that group.
  const filteredPosts = (isCoach && selectedGroup !== 'all') 
    ? posts.filter(p => p.group_id === selectedGroup) 
    : posts;
  const filteredChallenges = (isCoach && selectedGroup !== 'all') 
    ? challenges.filter(c => c.group_id === selectedGroup) 
    : challenges;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="w-full min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {user.role === 'admin' ? 'כל הקהילות במערכת 👑' : 'המשפחה שלנו 💪'}
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mb-4">
              {communityMembers.length} חברים • {posts.length} פוסטים • {challenges.length} אתגרים
            </p>
          </div>
          
          {isCoach && (
            <div className="mb-4">
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue placeholder="סנן לפי חוג" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל החוגים</SelectItem>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feed" className="text-sm"><MessageSquare className="w-4 h-4 ml-2"/>פיד הקהילה</TabsTrigger>
              <TabsTrigger value="challenges" className="text-sm"><Trophy className="w-4 h-4 ml-2"/>אתגרים</TabsTrigger>
            </TabsList>
            
            <TabsContent value="feed" className="mt-6">
              <div className="mb-6">
                {!showCreatePost ? (
                  <Card className="bg-white rounded-lg shadow-md p-3 sm:p-4">
                    <button 
                      onClick={() => setShowCreatePost(true)}
                      className="flex items-center gap-3 w-full p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all text-right"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {(user.hebrew_name || user.full_name || 'A')[0]}
                      </div>
                      <span className="text-gray-700 text-sm flex-1">
                        מה חדש, {user.hebrew_name || user.full_name}? שתף הישג או שאל שאלה...
                      </span>
                      <Plus className="w-5 h-5 text-blue-500" />
                    </button>
                  </Card>
                ) : (
                  <CreatePostForm 
                    onSubmit={handleCreatePost} 
                    onCancel={() => setShowCreatePost(false)}
                    user={user}
                    groups={groups}
                    isCoachOrAdmin={isCoach}
                  />
                )}
              </div>
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <Coffee className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">אין פוסטים להצגה</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {isCoach && selectedGroup !== 'all' 
                        ? "לא נמצאו פוסטים בחוג זה. נסה לבחור 'כל החוגים' או צור פוסט חדש לחוג." 
                        : (isCoach 
                            ? "היו הראשונים לשתף ולחבר את המשפחה!" 
                            : "אין פוסטים בחוג שלך כרגע. היו הראשונים לשתף!"
                          )
                      }
                    </p>
                    <Button 
                      onClick={() => setShowCreatePost(true)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      בואו נתחיל!
                    </Button>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <CommunityPostComponent
                      key={post.id}
                      post={post}
                      comments={commentsByPost[post.id] || []}
                      user={user}
                      onLike={handleLikePost}
                      onComment={handleComment}
                      onShowComments={() => loadCommentsForPost(post.id)}
                      onPin={() => {}}
                      isCoach={isCoach}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="challenges" className="mt-6">
              {isCoach && (
                <div className="mb-6 text-center">
                  <Button onClick={() => { setEditingChallenge(null); setShowChallengeForm(true); }}>
                    <Plus className="w-4 h-4 ml-2" />
                    צור אתגר חדש
                  </Button>
                </div>
              )}
              <div className="space-y-6">
                {filteredChallenges.length > 0 ? filteredChallenges.map(challenge => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    participations={participations.filter(p => p.challenge_id === challenge.id)}
                    user={user}
                    isCoach={isCoach}
                    onJoin={handleJoinChallenge}
                    onSubmitProof={handleSubmitProof}
                    onApprove={handleApproveSubmission}
                    onEdit={(c) => { setEditingChallenge(c); setShowChallengeForm(true); }}
                    onToggleActive={handleToggleActive}
                    trainees={communityMembers}
                  />
                )) : (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <Award className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">אין אתגרים פעילים</h3>
                    {isCoach 
                      ? <p className="text-gray-600">{selectedGroup !== 'all' ? "לא נמצאו אתגרים בחוג זה." : "זה הזמן ליצור אתגר חדש!"}</p>
                      : <p className="text-gray-600">בקרוב המאמן שלך יוסיף אתגרים חדשים!</p>}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="bg-white rounded-lg shadow-md mt-6 p-4">
            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              {user.role === 'admin' ? 'כל המשתמשים במערכת' : 'המשפחה שלנו'} ({communityMembers.length})
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {communityMembers.map((member) => (
                <div key={member.id} className="text-center p-2 bg-gray-100 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mx-auto mb-1">
                    {(member.hebrew_name || member.full_name || 'A')[0]}
                  </div>
                  <p className="text-gray-700 text-xs truncate">
                    {member.hebrew_name || member.full_name}
                  </p>
                  {member.is_coach && (
                     <Badge variant="secondary" className="mt-1 text-xs px-2 py-0.5 bg-yellow-200 text-yellow-800">מאמן</Badge>
                  )}
                  {member.role === 'admin' && (
                     <Badge variant="secondary" className="mt-1 text-xs px-2 py-0.5 bg-purple-200 text-purple-800">מנהל</Badge>
                  )}
                  {(member.points > 0 && !member.is_coach && member.role !== 'admin') && (
                     <Badge variant="secondary" className="mt-1 text-xs px-2 py-0.5 bg-green-200 text-green-800">
                       {member.points || 0} נק'
                     </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ChallengeForm 
        open={showChallengeForm}
        onClose={() => setShowChallengeForm(false)}
        onSave={handleSaveChallenge}
        challenge={editingChallenge}
        groups={groups}
      />
    </div>
  );
}
