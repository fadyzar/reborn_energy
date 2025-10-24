/*
  # Auto-Create User Profile on Signup

  ## Overview
  This migration creates a database trigger that automatically creates a user_profiles entry
  whenever a new user signs up through Supabase Auth. This ensures that every authenticated
  user always has a corresponding profile in the user_profiles table.

  ## Changes
  1. Create trigger function to auto-insert user profile
     - Extracts email from auth.users
     - Extracts full_name from user metadata if available
     - Sets default role to 'trainee'
     - Handles the case where profile already exists (DO NOTHING)

  2. Create trigger on auth.users
     - Fires AFTER INSERT on auth.users table
     - Automatically creates matching user_profiles entry

  ## Security
  - Function runs with SECURITY DEFINER to bypass RLS
  - Only creates profiles for new users
  - Uses INSERT ... ON CONFLICT DO NOTHING for safety

  ## Important Notes
  - This solves the "No profile found for user" error
  - Ensures AuthContext never gets stuck in loading state
  - Works for all signup methods (email/password, OAuth, etc.)
*/

-- Create function to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'trainee'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
