/*
  # Allow NULL for Onboarding Fields

  1. Changes
    - Make `role` and `sobriety_date` nullable in profiles table
    - This allows users to complete onboarding after signup
    - Users must set these values during onboarding flow
  
  2. Notes
    - Role still has a default value of 'sponsee' for backwards compatibility
    - Sobriety date must be explicitly set during onboarding
*/

-- Make role nullable (keep default for backwards compatibility)
ALTER TABLE profiles ALTER COLUMN role DROP NOT NULL;

-- Make sobriety_date nullable
ALTER TABLE profiles ALTER COLUMN sobriety_date DROP NOT NULL;