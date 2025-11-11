/*
  # Create Initial Schema for Sobriety AA Tracking App

  ## Overview
  This migration creates the complete database schema for a sponsor-sponsee AA tracking application.
  It includes user profiles, relationships, tasks, messages, and progress tracking.

  ## New Tables

  1. **profiles**
    - `id` (uuid, primary key, references auth.users)
    - `email` (text)
    - `full_name` (text)
    - `phone` (text, optional)
    - `avatar_url` (text, optional)
    - `role` (text, 'sponsor' or 'sponsee' or 'both')
    - `sobriety_date` (date, when they started their sobriety journey)
    - `bio` (text, optional)
    - `timezone` (text)
    - `notification_preferences` (jsonb, stores notification settings)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. **sponsor_sponsee_relationships**
    - `id` (uuid, primary key)
    - `sponsor_id` (uuid, references profiles)
    - `sponsee_id` (uuid, references profiles)
    - `status` (text, 'pending', 'active', 'inactive')
    - `connected_at` (timestamptz)
    - `disconnected_at` (timestamptz, optional)
    - `created_at` (timestamptz)

  3. **invite_codes**
    - `id` (uuid, primary key)
    - `code` (text, unique invite code)
    - `sponsor_id` (uuid, references profiles)
    - `expires_at` (timestamptz)
    - `used_by` (uuid, references profiles, nullable)
    - `used_at` (timestamptz, nullable)
    - `created_at` (timestamptz)

  4. **steps_content**
    - `id` (uuid, primary key)
    - `step_number` (integer, 1-12)
    - `title` (text)
    - `description` (text)
    - `detailed_content` (text, full educational content)
    - `reflection_prompts` (jsonb, array of questions)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  5. **tasks**
    - `id` (uuid, primary key)
    - `sponsor_id` (uuid, references profiles)
    - `sponsee_id` (uuid, references profiles)
    - `step_number` (integer, 1-12)
    - `title` (text)
    - `description` (text)
    - `due_date` (date, optional)
    - `status` (text, 'assigned', 'in_progress', 'completed')
    - `completion_notes` (text, optional)
    - `completed_at` (timestamptz, optional)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  6. **relapses**
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `relapse_date` (date)
    - `recovery_restart_date` (date)
    - `notes` (text, optional private notes)
    - `created_at` (timestamptz)

  7. **messages**
    - `id` (uuid, primary key)
    - `sender_id` (uuid, references profiles)
    - `recipient_id` (uuid, references profiles)
    - `content` (text)
    - `read_at` (timestamptz, nullable)
    - `created_at` (timestamptz)

  8. **notifications**
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `type` (text, 'task_assigned', 'milestone', 'message', 'connection_request')
    - `title` (text)
    - `content` (text)
    - `data` (jsonb, additional data)
    - `read_at` (timestamptz, nullable)
    - `created_at` (timestamptz)

  ## Security

  - Enable RLS on all tables
  - Add policies for authenticated users to read/write their own data
  - Sponsors can view their sponsees' data
  - Sponsees can view their sponsor's data
  - Messages are only visible to sender and recipient
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  role text NOT NULL CHECK (role IN ('sponsor', 'sponsee', 'both')) DEFAULT 'sponsee',
  sobriety_date date NOT NULL,
  bio text,
  timezone text DEFAULT 'UTC',
  notification_preferences jsonb DEFAULT '{"tasks": true, "messages": true, "milestones": true, "daily": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sponsor_sponsee_relationships table
CREATE TABLE IF NOT EXISTS sponsor_sponsee_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sponsee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'active', 'inactive')) DEFAULT 'active',
  connected_at timestamptz DEFAULT now(),
  disconnected_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sponsor_id, sponsee_id)
);

-- Create invite_codes table
CREATE TABLE IF NOT EXISTS invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  sponsor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create steps_content table
CREATE TABLE IF NOT EXISTS steps_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number integer UNIQUE NOT NULL CHECK (step_number >= 1 AND step_number <= 12),
  title text NOT NULL,
  description text NOT NULL,
  detailed_content text NOT NULL,
  reflection_prompts jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sponsee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  step_number integer NOT NULL CHECK (step_number >= 1 AND step_number <= 12),
  title text NOT NULL,
  description text NOT NULL,
  due_date date,
  status text NOT NULL CHECK (status IN ('assigned', 'in_progress', 'completed')) DEFAULT 'assigned',
  completion_notes text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create relapses table
CREATE TABLE IF NOT EXISTS relapses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relapse_date date NOT NULL,
  recovery_restart_date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('task_assigned', 'milestone', 'message', 'connection_request', 'task_completed')),
  title text NOT NULL,
  content text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_sponsee_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE relapses ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their sponsor's profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_sponsee_relationships
      WHERE sponsee_id = auth.uid() 
      AND sponsor_id = profiles.id 
      AND status = 'active'
    )
  );

CREATE POLICY "Users can view their sponsees' profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_sponsee_relationships
      WHERE sponsor_id = auth.uid() 
      AND sponsee_id = profiles.id 
      AND status = 'active'
    )
  );

-- Relationships policies
CREATE POLICY "Users can view their own relationships"
  ON sponsor_sponsee_relationships FOR SELECT
  TO authenticated
  USING (sponsor_id = auth.uid() OR sponsee_id = auth.uid());

CREATE POLICY "Sponsors can create relationships"
  ON sponsor_sponsee_relationships FOR INSERT
  TO authenticated
  WITH CHECK (sponsor_id = auth.uid());

CREATE POLICY "Users can update their relationships"
  ON sponsor_sponsee_relationships FOR UPDATE
  TO authenticated
  USING (sponsor_id = auth.uid() OR sponsee_id = auth.uid())
  WITH CHECK (sponsor_id = auth.uid() OR sponsee_id = auth.uid());

-- Invite codes policies
CREATE POLICY "Anyone can view valid invite codes"
  ON invite_codes FOR SELECT
  TO authenticated
  USING (expires_at > now() AND used_by IS NULL);

CREATE POLICY "Sponsors can create invite codes"
  ON invite_codes FOR INSERT
  TO authenticated
  WITH CHECK (sponsor_id = auth.uid());

CREATE POLICY "Sponsors can view their own invite codes"
  ON invite_codes FOR SELECT
  TO authenticated
  USING (sponsor_id = auth.uid());

CREATE POLICY "Users can update invite codes when using them"
  ON invite_codes FOR UPDATE
  TO authenticated
  USING (expires_at > now() AND used_by IS NULL)
  WITH CHECK (used_by = auth.uid());

-- Steps content policies (public read)
CREATE POLICY "Anyone can view steps content"
  ON steps_content FOR SELECT
  TO authenticated
  USING (true);

-- Tasks policies
CREATE POLICY "Sponsees can view their own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (sponsee_id = auth.uid());

CREATE POLICY "Sponsors can view tasks they assigned"
  ON tasks FOR SELECT
  TO authenticated
  USING (sponsor_id = auth.uid());

CREATE POLICY "Sponsors can create tasks for their sponsees"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    sponsor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM sponsor_sponsee_relationships
      WHERE sponsor_id = auth.uid() 
      AND sponsee_id = tasks.sponsee_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Sponsors can update tasks they created"
  ON tasks FOR UPDATE
  TO authenticated
  USING (sponsor_id = auth.uid())
  WITH CHECK (sponsor_id = auth.uid());

CREATE POLICY "Sponsees can update their assigned tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (sponsee_id = auth.uid())
  WITH CHECK (sponsee_id = auth.uid());

CREATE POLICY "Sponsors can delete tasks they created"
  ON tasks FOR DELETE
  TO authenticated
  USING (sponsor_id = auth.uid());

-- Relapses policies
CREATE POLICY "Users can view own relapses"
  ON relapses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own relapses"
  ON relapses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own relapses"
  ON relapses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own relapses"
  ON relapses FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Sponsors can view their sponsees' relapses"
  ON relapses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsor_sponsee_relationships
      WHERE sponsor_id = auth.uid() 
      AND sponsee_id = relapses.user_id 
      AND status = 'active'
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages they sent"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "Users can view messages they received"
  ON messages FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can send messages to connected users"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM sponsor_sponsee_relationships
        WHERE (sponsor_id = auth.uid() AND sponsee_id = recipient_id AND status = 'active')
        OR (sponsee_id = auth.uid() AND sponsor_id = recipient_id AND status = 'active')
      )
    )
  );

CREATE POLICY "Recipients can update message read status"
  ON messages FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_relationships_sponsor ON sponsor_sponsee_relationships(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_relationships_sponsee ON sponsor_sponsee_relationships(sponsee_id);
CREATE INDEX IF NOT EXISTS idx_relationships_status ON sponsor_sponsee_relationships(status);
CREATE INDEX IF NOT EXISTS idx_tasks_sponsee ON tasks(sponsee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sponsor ON tasks(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_steps_content_updated_at BEFORE UPDATE ON steps_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
