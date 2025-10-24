/*
  # Add is_coach column to user_profiles

  1. Changes
    - Add `is_coach` boolean column to `user_profiles` table
    - Set default value based on role
    - Update existing records to set is_coach = true where role = 'coach'
    - Add index for faster queries
  
  2. Purpose
    - Support both `role` and `is_coach` fields for compatibility
    - Improve query performance
*/

-- Add is_coach column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_coach BOOLEAN DEFAULT false;

-- Update existing records
UPDATE user_profiles 
SET is_coach = true 
WHERE role = 'coach';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_coach ON user_profiles(is_coach);

-- Create function to auto-update is_coach when role changes
CREATE OR REPLACE FUNCTION update_is_coach()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_coach := (NEW.role = 'coach');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_is_coach ON user_profiles;
CREATE TRIGGER trigger_update_is_coach
  BEFORE INSERT OR UPDATE OF role ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_is_coach();
