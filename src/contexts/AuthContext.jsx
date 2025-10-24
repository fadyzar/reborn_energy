import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, auth } from '@/api/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: authListener } = auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { session } = await auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        console.warn('No profile found for user:', userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await auth.signUp(email, password, userData);
      if (error) {
        console.error('Signup error:', error);
        return { data: null, error };
      }

      if (data?.user) {
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: data.user.id,
                email: email,
                full_name: userData.full_name,
                role: userData.role || 'trainee',
                coach_id: userData.coach_id || null
              }
            ]);

          if (profileError) {
            console.error('Profile creation error:', profileError);
            return {
              data: null,
              error: { message: 'נוצר חשבון אך נכשלה יצירת הפרופיל. אנא נסה להתחבר.' }
            };
          }

          setUser(data.user);
          await fetchUserProfile(data.user.id);
        } catch (profileError) {
          console.error('Profile creation error:', profileError);
          return {
            data: null,
            error: { message: 'שגיאה ביצירת פרופיל. אנא נסה שוב.' }
          };
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await auth.signIn(email, password);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isCoach: profile?.role === 'coach',
    isTrainee: profile?.role === 'trainee'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
