/*
  # Water Intake Tracking System

  ## Overview
  Creates a comprehensive water intake tracking system for users to monitor their daily hydration.

  ## New Tables
  
  ### `water_logs`
  Tracks water intake throughout the day:
  - `id` (uuid, primary key) - Unique identifier for each water log entry
  - `user_id` (uuid, foreign key) - References user_profiles, identifies who logged the water
  - `amount_ml` (integer) - Amount of water consumed in milliliters
  - `date` (date) - Date when water was consumed
  - `time` (time) - Specific time of consumption
  - `notes` (text, optional) - Additional notes about the intake
  - `created_at` (timestamptz) - When the record was created
  - `updated_at` (timestamptz) - When the record was last updated

  ### `user_water_goals`
  Stores personalized daily water intake goals:
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References user_profiles
  - `daily_goal_ml` (integer) - Daily water intake goal in milliliters (default 2000ml)
  - `reminder_enabled` (boolean) - Whether reminders are enabled
  - `reminder_interval_minutes` (integer) - Interval between reminders in minutes
  - `active_hours_start` (time) - Start of active hours for reminders
  - `active_hours_end` (time) - End of active hours for reminders
  - `created_at` (timestamptz) - When the record was created
  - `updated_at` (timestamptz) - When the record was last updated

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own water logs and goals
  - Restrictive policies ensuring data privacy

  ## Indexes
  - Index on (user_id, date) for fast daily queries
  - Index on user_id for user-specific queries
*/

-- Create water_logs table
CREATE TABLE IF NOT EXISTS water_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount_ml integer NOT NULL CHECK (amount_ml > 0 AND amount_ml <= 5000),
  date date NOT NULL DEFAULT CURRENT_DATE,
  time time NOT NULL DEFAULT CURRENT_TIME,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_water_goals table
CREATE TABLE IF NOT EXISTS user_water_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  daily_goal_ml integer NOT NULL DEFAULT 2000 CHECK (daily_goal_ml >= 500 AND daily_goal_ml <= 10000),
  reminder_enabled boolean DEFAULT false,
  reminder_interval_minutes integer DEFAULT 60 CHECK (reminder_interval_minutes >= 15 AND reminder_interval_minutes <= 480),
  active_hours_start time DEFAULT '08:00:00',
  active_hours_end time DEFAULT '22:00:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON water_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_water_logs_user ON water_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_water_goals_user ON user_water_goals(user_id);

-- Enable Row Level Security
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_water_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for water_logs

-- Users can view their own water logs
CREATE POLICY "Users can view own water logs"
  ON water_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own water logs
CREATE POLICY "Users can insert own water logs"
  ON water_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own water logs
CREATE POLICY "Users can update own water logs"
  ON water_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own water logs
CREATE POLICY "Users can delete own water logs"
  ON water_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_water_goals

-- Users can view their own water goals
CREATE POLICY "Users can view own water goals"
  ON user_water_goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own water goals
CREATE POLICY "Users can insert own water goals"
  ON user_water_goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own water goals
CREATE POLICY "Users can update own water goals"
  ON user_water_goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own water goals
CREATE POLICY "Users can delete own water goals"
  ON user_water_goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_water_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER water_logs_updated_at
  BEFORE UPDATE ON water_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_water_updated_at();

CREATE TRIGGER user_water_goals_updated_at
  BEFORE UPDATE ON user_water_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_water_updated_at();
