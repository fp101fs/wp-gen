-- Consolidate and clean up database triggers
-- This migration ensures we have only one trigger of each type

-- 1. Clean up any existing duplicate triggers
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_oauth_user_created ON auth.users;

-- 2. Clean up any existing duplicate functions
DROP FUNCTION IF EXISTS create_user_profile();

-- 3. Recreate the user profile creation function (consolidated version)
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert a new user profile when a user is created in auth.users
  -- This ensures every user gets a profile with proper defaults
  INSERT INTO user_profiles (
    id,
    current_tokens,
    total_tokens_used,
    tokens_reset_at,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    5,                           -- Default free tokens
    0,                           -- No tokens used initially  
    NULL,                        -- No reset date initially
    NOW(),                       -- Created timestamp
    NOW()                        -- Updated timestamp
  )
  ON CONFLICT (id) DO NOTHING;   -- Prevent duplicate inserts
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the user creation
  RAISE LOG 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. Create the user profile creation trigger
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- 5. Recreate the welcome email trigger (this is the main one we want to keep)
-- The function already exists from the previous migration, just recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email_for_oauth();

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_user_profile() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION send_welcome_email_for_oauth() TO postgres, service_role;

-- 7. Comments for documentation
COMMENT ON FUNCTION create_user_profile() IS 
'Creates user profile with default settings when a new user signs up. Handles both OAuth and email signups.';

COMMENT ON TRIGGER create_user_profile_trigger ON auth.users IS 
'Ensures every new user gets a user_profiles entry with default token allocation.';

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 
'Sends welcome email for all confirmed signups. Centralizes welcome email logic with deduplication.';