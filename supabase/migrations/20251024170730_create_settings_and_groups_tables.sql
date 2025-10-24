/*
  # Create Settings and Groups Tables

  ## Overview
  This migration creates the final tables for application settings and group management.

  ## New Tables Created

  ### 1. app_settings
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `setting_key` (text)
  - `setting_value` (jsonb)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. business_settings
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles) - must be coach
  - `business_name` (text)
  - `business_logo` (text)
  - `primary_color` (text)
  - `secondary_color` (text)
  - `subscription_plan` (text)
  - `max_trainees` (integer)
  - `features_enabled` (jsonb)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. groups
  - `id` (uuid, primary key)
  - `coach_id` (uuid, references user_profiles)
  - `name` (text)
  - `description` (text)
  - `member_ids` (jsonb) - array of user IDs
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. post_likes (for tracking who liked what)
  - `id` (uuid, primary key)
  - `post_id` (uuid, references community_posts)
  - `user_id` (uuid, references user_profiles)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can manage their own settings
  - Only coaches can manage business settings
  - Coaches can manage their own groups
*/

-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  setting_key text NOT NULL,
  setting_value jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON app_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create business_settings table
CREATE TABLE IF NOT EXISTS business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name text,
  business_logo text,
  primary_color text DEFAULT '#3b82f6',
  secondary_color text DEFAULT '#8b5cf6',
  subscription_plan text DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
  max_trainees integer DEFAULT 10,
  features_enabled jsonb DEFAULT '{"command_center": false, "analytics": true, "community": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view own business settings"
  ON business_settings FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

CREATE POLICY "Coaches can insert own business settings"
  ON business_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

CREATE POLICY "Coaches can update own business settings"
  ON business_settings FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  )
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  member_ids jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view own groups"
  ON groups FOR SELECT
  TO authenticated
  USING (auth.uid() = coach_id);

CREATE POLICY "Trainees can view groups they belong to"
  ON groups FOR SELECT
  TO authenticated
  USING (
    member_ids @> to_jsonb(auth.uid()::text)
  );

CREATE POLICY "Coaches can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = coach_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

CREATE POLICY "Coaches can update own groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete own groups"
  ON groups FOR DELETE
  TO authenticated
  USING (auth.uid() = coach_id);

-- Create post_likes table for tracking likes
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON post_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_app_settings_user ON app_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_business_settings_user ON business_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_coach ON groups(coach_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_settings_updated_at
  BEFORE UPDATE ON business_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update likes count when a like is added/removed
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_likes_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Function to update comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_comments_count_trigger
  AFTER INSERT OR DELETE ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Function to update challenge participants count
CREATE OR REPLACE FUNCTION update_challenge_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_challenges
    SET participants_count = participants_count + 1
    WHERE id = NEW.challenge_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_challenges
    SET participants_count = GREATEST(participants_count - 1, 0)
    WHERE id = OLD.challenge_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER challenge_participants_count_trigger
  AFTER INSERT OR DELETE ON challenge_participations
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_participants_count();
