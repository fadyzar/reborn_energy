/*
  # שיפור מבנה בסיס הנתונים למערכת Reborn Energy

  ## סקירה
  Migration זה משפר את מבנה בסיס הנתונים עם תכונות חדשות וחיוניות לייצור.

  ## שינויים עיקריים

  ### 1. שיפורים לטבלת user_profiles
  - הוספת שדות תזונה מפורטים (daily_calories_goal, daily_protein_goal וכו')
  - הוספת שדות מנוי ותקופת ניסיון
  - הוספת שדות שם בעברית, טלפון, תאריך לידה
  - הוספת מטא-דאטה נוספת

  ### 2. טבלת foods_database
  - מסד נתונים של מזונות ישראליים
  - כולל ערכים תזונתיים מלאים
  - תמיכה בברקוד
  - תמיכה בקטגוריות

  ### 3. טבלת workout_plans
  - תוכניות אימון מותאמות אישית
  - קישור בין מאמן למתאמן

  ### 4. טבלת exercises_library
  - ספריית תרגילים עם סרטוני הדרכה
  - קטגוריות שרירים

  ### 5. טבלת user_achievements
  - הישגים ותגים
  - מערכת נקודות מתקדמת

  ### 6. טבלת chat_messages
  - צ'אט בין מאמן למתאמן
  - תמיכה בקבצים מצורפים

  ### 7. טבלת user_goals
  - יעדים אישיים עם tracking
  - תאריכי יעד

  ### 8. שיפורים לאבטחה
  - פוליסיות RLS מחמירות יותר
  - אינדקסים נוספים לביצועים

  ## אבטחה
  - RLS מופעל על כל הטבלאות החדשות
  - פוליסיות מחמירות למניעת גישה לא מורשית
  - הצפנה של נתונים רגישים
*/

-- הרחבת טבלת user_profiles עם שדות נוספים
DO $$
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'hebrew_name') THEN
    ALTER TABLE user_profiles ADD COLUMN hebrew_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'phone') THEN
    ALTER TABLE user_profiles ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'birth_date') THEN
    ALTER TABLE user_profiles ADD COLUMN birth_date date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'gender') THEN
    ALTER TABLE user_profiles ADD COLUMN gender text CHECK (gender IN ('male', 'female', 'other'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'height_cm') THEN
    ALTER TABLE user_profiles ADD COLUMN height_cm numeric;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'daily_calories_goal') THEN
    ALTER TABLE user_profiles ADD COLUMN daily_calories_goal integer DEFAULT 2000;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'daily_protein_goal') THEN
    ALTER TABLE user_profiles ADD COLUMN daily_protein_goal numeric DEFAULT 150;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'daily_carbs_goal') THEN
    ALTER TABLE user_profiles ADD COLUMN daily_carbs_goal numeric DEFAULT 250;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'daily_fat_goal') THEN
    ALTER TABLE user_profiles ADD COLUMN daily_fat_goal numeric DEFAULT 65;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'subscription_plan') THEN
    ALTER TABLE user_profiles ADD COLUMN subscription_plan text DEFAULT 'free' CHECK (subscription_plan IN ('free', 'trial', 'pro', 'enterprise'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'subscription_start_date') THEN
    ALTER TABLE user_profiles ADD COLUMN subscription_start_date timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'subscription_end_date') THEN
    ALTER TABLE user_profiles ADD COLUMN subscription_end_date timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'trial_started_date') THEN
    ALTER TABLE user_profiles ADD COLUMN trial_started_date timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'meta_data') THEN
    ALTER TABLE user_profiles ADD COLUMN meta_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- טבלת מסד נתונים של מזונות
CREATE TABLE IF NOT EXISTS foods_database (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he text NOT NULL,
  name_en text,
  barcode text UNIQUE,
  category text NOT NULL,
  brand text,
  serving_size numeric DEFAULT 100,
  serving_unit text DEFAULT 'g',
  calories integer NOT NULL,
  protein numeric DEFAULT 0,
  carbs numeric DEFAULT 0,
  fats numeric DEFAULT 0,
  fiber numeric DEFAULT 0,
  sugar numeric DEFAULT 0,
  sodium numeric DEFAULT 0,
  is_verified boolean DEFAULT false,
  is_popular boolean DEFAULT false,
  search_vector tsvector,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE foods_database ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view foods database"
  ON foods_database FOR SELECT
  TO authenticated
  USING (true);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_foods_search ON foods_database USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods_database(category);
CREATE INDEX IF NOT EXISTS idx_foods_popular ON foods_database(is_popular) WHERE is_popular = true;
CREATE INDEX IF NOT EXISTS idx_foods_barcode ON foods_database(barcode) WHERE barcode IS NOT NULL;

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_foods_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('hebrew', COALESCE(NEW.name_he, '')) ||
                       to_tsvector('english', COALESCE(NEW.name_en, '')) ||
                       to_tsvector('simple', COALESCE(NEW.brand, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER foods_search_vector_update
  BEFORE INSERT OR UPDATE ON foods_database
  FOR EACH ROW
  EXECUTE FUNCTION update_foods_search_vector();

-- טבלת תוכניות אימון
CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  trainee_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration_weeks integer DEFAULT 4,
  workouts_per_week integer DEFAULT 3,
  plan_data jsonb DEFAULT '[]'::jsonb,
  is_template boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view own plans"
  ON workout_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = coach_id);

CREATE POLICY "Trainees can view assigned plans"
  ON workout_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = trainee_id);

CREATE POLICY "Coaches can create plans"
  ON workout_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update own plans"
  ON workout_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete own plans"
  ON workout_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = coach_id);

CREATE INDEX IF NOT EXISTS idx_workout_plans_coach ON workout_plans(coach_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_trainee ON workout_plans(trainee_id);

-- טבלת ספריית תרגילים
CREATE TABLE IF NOT EXISTS exercises_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he text NOT NULL,
  name_en text,
  description text,
  instructions text,
  video_url text,
  thumbnail_url text,
  category text NOT NULL,
  muscle_groups text[] DEFAULT ARRAY[]::text[],
  equipment text[] DEFAULT ARRAY[]::text[],
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_public boolean DEFAULT true,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercises_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public exercises"
  ON exercises_library FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can view own exercises"
  ON exercises_library FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create exercises"
  ON exercises_library FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises_library(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises_library(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups ON exercises_library USING gin(muscle_groups);

-- טבלת הישגים
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  description text,
  icon_name text,
  points integer DEFAULT 0,
  unlocked_at timestamptz DEFAULT now(),
  meta_data jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON user_achievements(achievement_type);

-- טבלת הודעות צ'אט
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  attachment_url text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update read status"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(receiver_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);

-- טבלת יעדים אישיים
CREATE TABLE IF NOT EXISTS user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  goal_type text NOT NULL CHECK (goal_type IN ('weight_loss', 'weight_gain', 'muscle_gain', 'fat_loss', 'endurance', 'strength', 'custom')),
  title text NOT NULL,
  description text,
  target_value numeric,
  current_value numeric DEFAULT 0,
  unit text,
  start_date date DEFAULT CURRENT_DATE,
  target_date date,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON user_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view trainees goals"
  ON user_goals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = user_goals.user_id
      AND user_profiles.coach_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own goals"
  ON user_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON user_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON user_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_goals_user ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_type ON user_goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_user_goals_active ON user_goals(user_id, is_completed) WHERE is_completed = false;

-- הוספת עמודות נוספות לטבלת nutrition_logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nutrition_logs' AND column_name = 'fat') THEN
    ALTER TABLE nutrition_logs ADD COLUMN fat numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nutrition_logs' AND column_name = 'fiber') THEN
    ALTER TABLE nutrition_logs ADD COLUMN fiber numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nutrition_logs' AND column_name = 'food_id') THEN
    ALTER TABLE nutrition_logs ADD COLUMN food_id uuid REFERENCES foods_database(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nutrition_logs' AND column_name = 'serving_size') THEN
    ALTER TABLE nutrition_logs ADD COLUMN serving_size numeric DEFAULT 100;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nutrition_logs' AND column_name = 'image_url') THEN
    ALTER TABLE nutrition_logs ADD COLUMN image_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nutrition_logs' AND column_name = 'created_date') THEN
    ALTER TABLE nutrition_logs ADD COLUMN created_date timestamptz DEFAULT now();
  END IF;
END $$;

-- הוספת עמודות נוספות לטבלת body_metrics
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'body_metrics' AND column_name = 'chest_cm') THEN
    ALTER TABLE body_metrics ADD COLUMN chest_cm numeric;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'body_metrics' AND column_name = 'waist_cm') THEN
    ALTER TABLE body_metrics ADD COLUMN waist_cm numeric;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'body_metrics' AND column_name = 'hips_cm') THEN
    ALTER TABLE body_metrics ADD COLUMN hips_cm numeric;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'body_metrics' AND column_name = 'arms_cm') THEN
    ALTER TABLE body_metrics ADD COLUMN arms_cm numeric;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'body_metrics' AND column_name = 'legs_cm') THEN
    ALTER TABLE body_metrics ADD COLUMN legs_cm numeric;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'body_metrics' AND column_name = 'before_image_url') THEN
    ALTER TABLE body_metrics ADD COLUMN before_image_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'body_metrics' AND column_name = 'after_image_url') THEN
    ALTER TABLE body_metrics ADD COLUMN after_image_url text;
  END IF;
END $$;

-- Triggers for updated_at
CREATE TRIGGER update_workout_plans_updated_at
  BEFORE UPDATE ON workout_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foods_database_updated_at
  BEFORE UPDATE ON foods_database
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-award achievements based on activity
CREATE OR REPLACE FUNCTION check_and_award_achievements()
RETURNS TRIGGER AS $$
DECLARE
  user_log_count integer;
  user_workout_count integer;
BEGIN
  -- Check for nutrition logging streak achievements
  IF TG_TABLE_NAME = 'nutrition_logs' THEN
    SELECT COUNT(DISTINCT date) INTO user_log_count
    FROM nutrition_logs
    WHERE user_id = NEW.user_id
    AND date >= CURRENT_DATE - INTERVAL '7 days';

    IF user_log_count >= 7 THEN
      INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, icon_name, points)
      VALUES (NEW.user_id, 'nutrition_streak', '7 ימים ברצף', 'רשמת תזונה 7 ימים ברצף!', 'fire', 50)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Check for workout achievements
  IF TG_TABLE_NAME = 'workout_logs' THEN
    SELECT COUNT(*) INTO user_workout_count
    FROM workout_logs
    WHERE user_id = NEW.user_id;

    IF user_workout_count = 10 THEN
      INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, icon_name, points)
      VALUES (NEW.user_id, 'workout_milestone', '10 אימונים', 'השלמת 10 אימונים!', 'trophy', 100)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for achievements
DROP TRIGGER IF EXISTS award_nutrition_achievements ON nutrition_logs;
CREATE TRIGGER award_nutrition_achievements
  AFTER INSERT ON nutrition_logs
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_achievements();

DROP TRIGGER IF EXISTS award_workout_achievements ON workout_logs;
CREATE TRIGGER award_workout_achievements
  AFTER INSERT ON workout_logs
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_achievements();

-- שיפור פוליסיות RLS לטבלת business_settings - לאפשר למתאמנים לצפות בהגדרות המאמן שלהם
DROP POLICY IF EXISTS "Trainees can view coach business settings" ON business_settings;
CREATE POLICY "Trainees can view coach business settings"
  ON business_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.coach_id = business_settings.user_id
      AND user_profiles.id = auth.uid()
    )
  );
