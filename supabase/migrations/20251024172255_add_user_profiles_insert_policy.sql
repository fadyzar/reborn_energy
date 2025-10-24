/*
  # Add INSERT Policy for User Profiles

  ## Overview
  Fixes the missing INSERT policy that prevents new users from being created during registration.
  This was causing 422 errors during signup because authenticated users couldn't insert their own profile.

  ## Changes
  1. Add INSERT policy for user_profiles table
     - Allows authenticated users to insert their own profile
     - Ensures user can only create profile with their own auth.uid()

  ## Security
  - Restrictive: Users can only create a profile for themselves
  - WITH CHECK ensures the id matches auth.uid()
*/

-- Add INSERT policy for user_profiles
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
