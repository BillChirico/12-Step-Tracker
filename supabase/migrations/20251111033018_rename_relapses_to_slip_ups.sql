/*
  # Rename relapses table to slip_ups

  1. Changes
    - Rename table from `relapses` to `slip_ups`
    - Rename column from `relapse_date` to `slip_up_date`
    - Update all RLS policy names to use "slip up" terminology
    - Maintain all existing functionality and constraints

  2. Security
    - All existing RLS policies are preserved with updated names
    - Users can view/insert/update/delete their own slip ups
    - Sponsors can view their sponsees' slip ups
*/

-- Rename the table
ALTER TABLE IF EXISTS relapses RENAME TO slip_ups;

-- Rename the relapse_date column to slip_up_date
ALTER TABLE IF EXISTS slip_ups 
  RENAME COLUMN relapse_date TO slip_up_date;

-- The RLS policies are automatically renamed with the table
-- But let's update their names for clarity
DROP POLICY IF EXISTS "Users can view own relapses" ON slip_ups;
DROP POLICY IF EXISTS "Users can insert own relapses" ON slip_ups;
DROP POLICY IF EXISTS "Users can update own relapses" ON slip_ups;
DROP POLICY IF EXISTS "Users can delete own relapses" ON slip_ups;
DROP POLICY IF EXISTS "Sponsors can view their sponsees' relapses" ON slip_ups;

-- Recreate policies with updated names
CREATE POLICY "Users can view own slip ups"
  ON slip_ups
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own slip ups"
  ON slip_ups
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own slip ups"
  ON slip_ups
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own slip ups"
  ON slip_ups
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Sponsors can view their sponsees' slip ups"
  ON slip_ups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_sponsee_relationships
      WHERE sponsor_sponsee_relationships.sponsor_id = auth.uid()
        AND sponsor_sponsee_relationships.sponsee_id = slip_ups.user_id
        AND sponsor_sponsee_relationships.status = 'active'
    )
  );
