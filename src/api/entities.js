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
    return { data, error };
  },

  update: async (id, values) => {
    const { data, error } = await supabase
      .from(tableName)
      .update(values)
      .eq('id', id)
      .select()
      .maybeSingle();
    return { data, error };
  },

  delete: async (id) => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    return { error };
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

export const User = {
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
    return { data, error };
  },

  getCurrentUser: async () => {
    return await auth.getCurrentUser();
  },

  signOut: async () => {
    return await auth.signOut();
  }
};
