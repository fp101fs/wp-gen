-- Migration: Add welcome email trigger for OAuth signups
-- This trigger automatically sends welcome emails for OAuth signups only

-- Add welcome email tracking fields to user_profiles (if they don't exist)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

-- Enable the http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- Create function to send welcome email for OAuth users
CREATE OR REPLACE FUNCTION send_welcome_email_for_oauth()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  is_oauth_signup BOOLEAN DEFAULT FALSE;
  http_response http_response;
  payload TEXT;
  already_sent BOOLEAN DEFAULT FALSE;
BEGIN
  -- This trigger should ONLY fire for INSERT operations (new user creation)
  -- It should not fire for UPDATE operations (logins)
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Extract user info
  user_email := NEW.email;
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    ''
  );

  -- Check if welcome email was already sent by checking user_profiles
  SELECT COALESCE(welcome_email_sent, FALSE) INTO already_sent
  FROM user_profiles 
  WHERE id = NEW.id;
  
  IF already_sent = TRUE THEN
    RAISE LOG 'Welcome email already sent for user: % (ID: %), skipping', user_email, NEW.id;
    RETURN NEW;
  END IF;

  -- Check if this is an OAuth signup (has provider data and no email confirmation required)
  -- OAuth users typically have confirmed_at set immediately and have provider info
  IF NEW.confirmed_at IS NOT NULL AND 
     (NEW.raw_user_meta_data->>'provider' IS NOT NULL OR 
      NEW.raw_user_meta_data->>'iss' LIKE '%google%' OR
      NEW.app_metadata->>'provider' != 'email') THEN
    is_oauth_signup := TRUE;
  END IF;

  -- Send welcome email for ALL confirmed signups (OAuth immediate, email after confirmation)
  -- This centralizes all welcome email logic in the database trigger
  IF NEW.confirmed_at IS NOT NULL THEN
    RAISE LOG 'Confirmed signup detected, sending welcome email for: % (ID: %)', user_email, NEW.id;
    
    -- Mark as sent BEFORE attempting to send (prevents duplicate calls)
    INSERT INTO user_profiles (id, welcome_email_sent, welcome_email_sent_at)
    VALUES (NEW.id, TRUE, NOW())
    ON CONFLICT (id) 
    DO UPDATE SET 
      welcome_email_sent = TRUE, 
      welcome_email_sent_at = NOW();
    
    -- Prepare JSON payload with user_id for deduplication
    payload := json_build_object(
      'email', user_email,
      'name', user_name,
      'user_id', NEW.id::text
    )::TEXT;

    -- Make HTTP request to our welcome email API
    -- Note: Replace 'https://plugin.new' with your actual domain
    SELECT * FROM http_post(
      'https://plugin.new/api/send-welcome-email',
      payload,
      'application/json'
    ) INTO http_response;

    -- Log the response (non-blocking)
    IF http_response.status = 200 THEN
      RAISE LOG 'Welcome email sent successfully for confirmed user: %', user_email;
    ELSE
      RAISE LOG 'Welcome email failed for confirmed user: % (Status: %)', user_email, http_response.status;
      -- Reset the flag if email failed
      UPDATE user_profiles 
      SET welcome_email_sent = FALSE, 
          welcome_email_sent_at = NULL
      WHERE id = NEW.id;
    END IF;
    
  ELSE
    RAISE LOG 'Unconfirmed signup detected, skipping welcome email: %', user_email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires on new user creation
-- Note: This trigger will be recreated in the consolidation migration
DROP TRIGGER IF EXISTS on_oauth_user_created ON auth.users;

-- Trigger creation is now handled in 20250829_consolidate_triggers.sql
-- to avoid conflicts with multiple triggers

-- Comment explaining the trigger
COMMENT ON FUNCTION send_welcome_email_for_oauth() IS 
'Automatically sends welcome email for ALL confirmed signups (OAuth immediate, email after confirmation). Prevents duplicates via database flag.';

-- Trigger comment is now in 20250829_consolidate_triggers.sql