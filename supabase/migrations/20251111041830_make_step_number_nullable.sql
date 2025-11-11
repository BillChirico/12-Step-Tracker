/*
  # Make Step Number Nullable for Tasks

  ## Overview
  This migration makes the step_number column nullable in the tasks table,
  allowing sponsors to assign general tasks that aren't tied to a specific step.

  ## Changes
  1. Alter tasks table to allow NULL values for step_number
  2. This enables more flexibility in task assignment

  ## Notes
  - Existing tasks with step numbers remain unchanged
  - New tasks can now be created without a step number
  - Templates still require step numbers (they are step-specific by design)
*/

-- Make step_number nullable in tasks table
ALTER TABLE tasks
ALTER COLUMN step_number DROP NOT NULL;
