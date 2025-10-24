/*
  # Create Community and Gamification Tables

  ## Overview
  This migration creates tables for community features and gamification system.

  ## New Tables Created

  ### 1. community_posts
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `content` (text)
  - `image_url` (text)
  - `likes_count` (integer)
  - `comments_count` (integer)
  - `created_at` (timestamptz)

  ### 2. community_comments
  - `id` (uuid, primary key)
  - `post_id` (uuid, references community_posts)
  - `user_id` (uuid, references user_profiles)
  - `content` (text)
  - `created_at` (timestamptz)

  ### 3. community_challenges
  - `id` (uuid, primary key)
  - `created_by` (uuid, references user_profiles)
  - `title` (text)
  - `description` (text)
  - `challenge_type` (text)
  - `start_date` (date)
  - `end_date` (date)
  - `goal_value` (numeric)
  - `participants_count` (integer)
  - `created_at` (timestamptz)

  ### 4. challenge_participations
  - `id` (uuid, primary key)
  - `challenge_id` (uuid, references community_challenges)
  - `user_id` (uuid, references user_profiles)
  - `progress` (numeric)
  - `completed` (boolean)
  - `joined_at` (timestamptz)

  ### 5. user_avatars
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `avatar_name` (text)
  - `level` (integer)
  - `experience_points` (integer)
  - `strength` (integer)
  - `endurance` (integer)
  - `flexibility` (integer)
  - `mental_power` (integer)
  - `avatar_image_url` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. item_blueprints
  - `id` (uuid, primary key)
  - `name` (text)
  - `description` (text)
  - `item_type` (text)
  - `rarity` (text)
  - `stat_bonus` (jsonb)
  - `image_url` (text)
  - `created_at` (timestamptz)

  ### 7. user_inventory
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `item_id` (uuid, references item_blueprints)
  - `quantity` (integer)
  - `is_equipped` (boolean)
  - `acquired_at` (timestamptz)

  ### 8. notifications
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `title` (text)
  - `message` (text)
  - `type` (text)
  - `is_read` (boolean)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Appropriate read/write policies for each table
  - Community features accessible to all authenticated users
  - Gamification data private to users and their coaches
*/

-- Create community_posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  image_url text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create community_comments table
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON community_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON community_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON community_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON community_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create community_challenges table
CREATE TABLE IF NOT EXISTS community_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  challenge_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  goal_value numeric DEFAULT 0,
  participants_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges"
  ON community_challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Coaches can create challenges"
  ON community_challenges FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

CREATE POLICY "Creators can update challenges"
  ON community_challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete challenges"
  ON community_challenges FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create challenge_participations table
CREATE TABLE IF NOT EXISTS challenge_participations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES community_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  progress numeric DEFAULT 0,
  completed boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE challenge_participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view participations"
  ON challenge_participations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join challenges"
  ON challenge_participations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON challenge_participations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_avatars table
CREATE TABLE IF NOT EXISTS user_avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  avatar_name text NOT NULL,
  level integer DEFAULT 1,
  experience_points integer DEFAULT 0,
  strength integer DEFAULT 10,
  endurance integer DEFAULT 10,
  flexibility integer DEFAULT 10,
  mental_power integer DEFAULT 10,
  avatar_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own avatar"
  ON user_avatars FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view trainees avatars"
  ON user_avatars FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = user_avatars.user_id
      AND user_profiles.coach_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own avatar"
  ON user_avatars FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own avatar"
  ON user_avatars FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create item_blueprints table
CREATE TABLE IF NOT EXISTS item_blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  item_type text NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  stat_bonus jsonb DEFAULT '{}'::jsonb,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE item_blueprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view item blueprints"
  ON item_blueprints FOR SELECT
  TO authenticated
  USING (true);

-- Create user_inventory table
CREATE TABLE IF NOT EXISTS user_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES item_blueprints(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1,
  is_equipped boolean DEFAULT false,
  acquired_at timestamptz DEFAULT now()
);

ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory"
  ON user_inventory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
  ON user_inventory FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert inventory items"
  ON user_inventory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can create notifications for trainees"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = notifications.user_id
      AND user_profiles.coach_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON community_challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_participations_user ON challenge_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Trigger for user_avatars updated_at
CREATE TRIGGER update_user_avatars_updated_at
  BEFORE UPDATE ON user_avatars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
