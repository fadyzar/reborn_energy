import { supabase, auth } from './supabaseClient';

const createEntity = (tableName) => ({
  getAll: async (options = {}) => {
    let query = supabase.from(tableName).select('*');

    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options.orderBy) {
      query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending !== false });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    return { data: data || [], error };
  },

  filter: async (filters = {}, orderBy = null, limit = null) => {
    let query = supabase.from(tableName).select('*');

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    if (orderBy) {
      const isDescending = orderBy.startsWith('-');
      const field = isDescending ? orderBy.substring(1) : orderBy;
      query = query.order(field, { ascending: !isDescending });
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return { data, error };
  },

  create: async (values) => {
    const { data, error } = await supabase
      .from(tableName)
      .insert([values])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  update: async (id, values) => {
    const { data, error } = await supabase
      .from(tableName)
      .update(values)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  }
});

export const NutritionLog = createEntity('nutrition_logs');
export const BodyMetrics = createEntity('body_metrics');
export const Recipe = createEntity('recipes');
export const CommunityPost = createEntity('community_posts');
export const CommunityComment = createEntity('community_comments');
export const CommunityChallenge = createEntity('community_challenges');
export const ChallengeParticipation = createEntity('challenge_participations');
export const Notification = createEntity('notifications');
export const AppSettings = createEntity('app_settings');
export const Group = createEntity('groups');
export const UserAvatar = createEntity('user_avatars');
export const WorkoutLog = createEntity('workout_logs');
export const ItemBlueprint = createEntity('item_blueprints');
export const UserInventory = createEntity('user_inventory');
export const BusinessSettings = createEntity('business_settings');
export const PostLike = createEntity('post_likes');

export const FoodsDatabase = {
  ...createEntity('foods_database'),

  search: async (searchTerm, limit = 20) => {
    const { data, error } = await supabase
      .from('foods_database')
      .select('*')
      .or(`name_he.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  getPopular: async (limit = 50) => {
    const { data, error } = await supabase
      .from('foods_database')
      .select('*')
      .eq('is_popular', true)
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  getByBarcode: async (barcode) => {
    const { data, error } = await supabase
      .from('foods_database')
      .select('*')
      .eq('barcode', barcode)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  getByCategory: async (category, limit = 50) => {
    const { data, error } = await supabase
      .from('foods_database')
      .select('*')
      .eq('category', category)
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};

export const WorkoutPlan = {
  ...createEntity('workout_plans'),

  getForTrainee: async (traineeId) => {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('trainee_id', traineeId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getTemplates: async () => {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('is_template', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

export const ExerciseLibrary = {
  ...createEntity('exercises_library'),

  searchExercises: async (searchTerm, limit = 20) => {
    const { data, error } = await supabase
      .from('exercises_library')
      .select('*')
      .or(`name_he.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%`)
      .eq('is_public', true)
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  getByCategory: async (category) => {
    const { data, error } = await supabase
      .from('exercises_library')
      .select('*')
      .eq('category', category)
      .eq('is_public', true);

    if (error) throw error;
    return data || [];
  },

  getByMuscleGroup: async (muscleGroup) => {
    const { data, error } = await supabase
      .from('exercises_library')
      .select('*')
      .contains('muscle_groups', [muscleGroup])
      .eq('is_public', true);

    if (error) throw error;
    return data || [];
  }
};

export const UserAchievement = {
  ...createEntity('user_achievements'),

  getUserAchievements: async (userId) => {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getTotalPoints: async (userId) => {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('points')
      .eq('user_id', userId);

    if (error) throw error;

    const totalPoints = data?.reduce((sum, achievement) => sum + (achievement.points || 0), 0) || 0;
    return totalPoints;
  }
};

export const ChatMessage = {
  ...createEntity('chat_messages'),

  getConversation: async (user1Id, user2Id, limit = 50) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`and(sender_id.eq.${user1Id},receiver_id.eq.${user2Id}),and(sender_id.eq.${user2Id},receiver_id.eq.${user1Id})`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data?.reverse() || [];
  },

  getUnreadCount: async (userId) => {
    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  markAsRead: async (messageId) => {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;
    return { success: true };
  },

  markConversationAsRead: async (senderId, receiverId) => {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .eq('is_read', false);

    if (error) throw error;
    return { success: true };
  }
};

export const UserGoal = {
  ...createEntity('user_goals'),

  getActiveGoals: async (userId) => {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getCompletedGoals: async (userId) => {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  completeGoal: async (goalId) => {
    const { data, error } = await supabase
      .from('user_goals')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};

export const User = {
  list: async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getAll: async (options = {}) => {
    let query = supabase.from('user_profiles').select('*');

    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;
    return { data: data || [], error };
  },

  filter: async (filters = {}, orderBy = null, limit = null) => {
    let query = supabase.from('user_profiles').select('*');

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    if (orderBy) {
      const isDescending = orderBy.startsWith('-');
      const field = isDescending ? orderBy.substring(1) : orderBy;
      query = query.order(field, { ascending: !isDescending });
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  me: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Profile not found');

    return data;
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return { data, error };
  },

  update: async (id, values) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(values)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  updateMyUserData: async (values) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(values)
      .eq('id', user.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  getCurrentUser: async () => {
    return await auth.getCurrentUser();
  },

  signOut: async () => {
    return await auth.signOut();
  },

  getCoachTrainees: async (coachId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getTraineeCoach: async (traineeId) => {
    const { data: trainee, error: traineeError } = await supabase
      .from('user_profiles')
      .select('coach_id')
      .eq('id', traineeId)
      .maybeSingle();

    if (traineeError) throw traineeError;
    if (!trainee || !trainee.coach_id) return null;

    const { data: coach, error: coachError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', trainee.coach_id)
      .maybeSingle();

    if (coachError) throw coachError;
    return coach;
  }
};
