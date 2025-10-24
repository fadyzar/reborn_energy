/*
  # Create User Profiles and Core Tables

  ## Overview
  This migration creates the foundational database schema for the fitness coaching application,
  replacing the Base44 SDK with native Supabase tables.

  ## New Tables Created

  ### 1. user_profiles
  - `id` (uuid, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `role` (text) - 'coach' or 'trainee'
  - `avatar_url` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. nutrition_logs
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `date` (date)
  - `meal_type` (text) - breakfast, lunch, dinner, snack
  - `food_name` (text)
  - `calories` (integer)
  - `protein` (numeric)
  - `carbs` (numeric)
  - `fats` (numeric)
  - `created_at` (timestamptz)

  ### 3. body_metrics
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `date` (date)
  - `weight` (numeric)
  - `body_fat_percentage` (numeric)
  - `muscle_mass` (numeric)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 4. workout_logs
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `date` (date)
  - `workout_type` (text)
  - `duration_minutes` (integer)
  - `exercises` (jsonb)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 5. recipes
  - `id` (uuid, primary key)
  - `created_by` (uuid, references user_profiles)
  - `title` (text)
  - `description` (text)
  - `ingredients` (jsonb)
  - `instructions` (text)
  - `calories` (integer)
  - `protein` (numeric)
  - `carbs` (numeric)
  - `fats` (numeric)
  - `prep_time_minutes` (integer)
  - `is_public` (boolean)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can read their own data
  - Users can update their own data
  - Coaches can read their trainees' data
  - Public recipes are readable by all authenticated users

  ## Important Notes
  - All tables use UUID primary keys with auto-generation
  - Timestamps default to now()
  - Foreign keys ensure referential integrity
  - Indexes added for common query patterns
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'trainee' CHECK (role IN ('coach', 'trainee')),
  avatar_url text,
  coach_id uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Coaches can view their trainees"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    coach_id = auth.uid() OR auth.uid() = id
  );

-- Create nutrition_logs table
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name text NOT NULL,
  calories integer DEFAULT 0,
  protein numeric DEFAULT 0,
  carbs numeric DEFAULT 0,
  fats numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nutrition logs"
  ON nutrition_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition logs"
  ON nutrition_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs"
  ON nutrition_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition logs"
  ON nutrition_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view trainees nutrition logs"
  ON nutrition_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = nutrition_logs.user_id
      AND user_profiles.coach_id = auth.uid()
    )
  );

-- Create body_metrics table
CREATE TABLE IF NOT EXISTS body_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  weight numeric,
  body_fat_percentage numeric,
  muscle_mass numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own body metrics"
  ON body_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own body metrics"
  ON body_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own body metrics"
  ON body_metrics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own body metrics"
  ON body_metrics FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view trainees body metrics"
  ON body_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = body_metrics.user_id
      AND user_profiles.coach_id = auth.uid()
    )
  );

-- Create workout_logs table
CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  workout_type text,
  duration_minutes integer DEFAULT 0,
  exercises jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout logs"
  ON workout_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs"
  ON workout_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs"
  ON workout_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs"
  ON workout_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view trainees workout logs"
  ON workout_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = workout_logs.user_id
      AND user_profiles.coach_id = auth.uid()
    )
  );

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  ingredients jsonb DEFAULT '[]'::jsonb,
  instructions text,
  calories integer DEFAULT 0,
  protein numeric DEFAULT 0,
  carbs numeric DEFAULT 0,
  fats numeric DEFAULT 0,
  prep_time_minutes integer DEFAULT 0,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view public recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date ON body_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_public ON recipes(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_user_profiles_coach ON user_profiles(coach_id) WHERE coach_id IS NOT NULL;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
