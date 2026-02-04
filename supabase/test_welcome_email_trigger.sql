-- Manual test script for the welcome email trigger
-- Run this in Supabase SQL Editor to test the trigger function

-- First, let's check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  trigger_schema,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if the function exists
SELECT 
  routine_name,
  routine_type,
  external_language
FROM information_schema.routines 
WHERE routine_name = 'send_welcome_email_for_oauth';

-- Check if http extension is available
SELECT * FROM pg_available_extensions WHERE name = 'http';
SELECT * FROM pg_extension WHERE extname = 'http';

-- Test the function directly (this simulates a new OAuth user signup)
-- Replace 'test-email@example.com' with your actual test email
DO $$
DECLARE
  test_user_record RECORD;
  test_result RECORD;
BEGIN
  -- Create a mock user record similar to what auth.users would have
  test_user_record := ROW(
    gen_random_uuid(),                          -- id
    NULL,                                       -- aud
    'authenticated',                            -- role  
    'test-email@example.com',                   -- email
    crypt('password123', gen_salt('bf')),       -- encrypted_password
    NOW(),                                      -- email_confirmed_at (confirmed user)
    NULL,                                       -- invited_at
    NULL,                                       -- confirmation_token
    NULL,                                       -- confirmation_sent_at
    NULL,                                       -- recovery_token
    NULL,                                       -- recovery_sent_at
    NULL,                                       -- email_change_token_new
    NULL,                                       -- email_change
    NULL,                                       -- email_change_sent_at
    NOW(),                                      -- last_sign_in_at
    '{"provider": "google", "full_name": "Test User"}'::jsonb, -- raw_user_meta_data
    '{"provider": "google"}'::jsonb,            -- raw_app_meta_data
    1,                                          -- is_super_admin
    NOW(),                                      -- created_at
    NOW(),                                      -- updated_at
    NULL,                                       -- phone
    NULL,                                       -- phone_confirmed_at
    NULL,                                       -- phone_change
    NULL,                                       -- phone_change_token
    NULL,                                       -- phone_change_sent_at
    NULL,                                       -- confirmed_at
    NULL,                                       -- email_change_token_current
    NULL,                                       -- email_change_confirm_status
    NULL,                                       -- banned_until
    NULL                                        -- deletion_requested_at
  );

  -- Manually call the trigger function
  RAISE LOG 'TESTING: About to call welcome email trigger function...';
  
  -- This simulates what happens when the trigger fires
  PERFORM send_welcome_email_for_oauth() FROM (SELECT test_user_record AS NEW) AS trigger_data;
  
  RAISE LOG 'TESTING: Trigger function call completed';
END $$;

-- Check the logs to see what happened
-- (You'll need to check your Supabase logs/dashboard for the RAISE LOG output)

-- Alternative: Test with a real user ID if you have one
-- Uncomment and modify the following if you want to test with an existing user:

/*
DO $$
DECLARE
  existing_user auth.users%ROWTYPE;
BEGIN
  -- Get an existing user (replace with actual user ID or email)
  SELECT * INTO existing_user 
  FROM auth.users 
  WHERE email = 'your-test-email@example.com' 
  LIMIT 1;
  
  IF existing_user.id IS NOT NULL THEN
    -- Reset their email flag first
    UPDATE user_profiles 
    SET welcome_email_sent = FALSE, welcome_email_sent_at = NULL 
    WHERE id = existing_user.id;
    
    -- Now test the trigger
    PERFORM send_welcome_email_for_oauth() 
    FROM (SELECT existing_user AS NEW) AS trigger_data;
    
    RAISE LOG 'TESTING: Completed trigger test for existing user %', existing_user.email;
  ELSE
    RAISE LOG 'TESTING: No existing user found for testing';
  END IF;
END $$;
*/

-- Check user_profiles to see if the flag was set
SELECT 
  id,
  welcome_email_sent,
  welcome_email_sent_at,
  created_at
FROM user_profiles 
WHERE welcome_email_sent = TRUE
ORDER BY welcome_email_sent_at DESC 
LIMIT 5;