-- Debug and fix the welcome email trigger function
-- This migration adds comprehensive logging and improves error handling

-- Update the welcome email trigger function with debug logging
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
  RAISE LOG 'DEBUG: Welcome email trigger fired for operation: %', TG_OP;
  
  -- This trigger should ONLY fire for INSERT operations (new user creation)
  -- It should not fire for UPDATE operations (logins)
  IF TG_OP != 'INSERT' THEN
    RAISE LOG 'DEBUG: Skipping non-INSERT operation: %', TG_OP;
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

  RAISE LOG 'DEBUG: Processing new user - Email: %, Name: %, ID: %, Confirmed: %', 
    user_email, user_name, NEW.id, NEW.confirmed_at;

  -- Check if welcome email was already sent by checking user_profiles
  BEGIN
    SELECT COALESCE(welcome_email_sent, FALSE) INTO already_sent
    FROM user_profiles 
    WHERE id = NEW.id;
    
    RAISE LOG 'DEBUG: Database check - already_sent: %', already_sent;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'WARNING: Failed to check user_profiles for user %: %', NEW.id, SQLERRM;
    already_sent := FALSE; -- Continue anyway
  END;
  
  IF already_sent = TRUE THEN
    RAISE LOG 'INFO: Welcome email already sent for user: % (ID: %), skipping', user_email, NEW.id;
    RETURN NEW;
  END IF;

  -- Check if this is an OAuth signup (has provider data and no email confirmation required)
  -- OAuth users typically have confirmed_at set immediately and have provider info
  IF NEW.confirmed_at IS NOT NULL AND 
     (NEW.raw_user_meta_data->>'provider' IS NOT NULL OR 
      NEW.raw_user_meta_data->>'iss' LIKE '%google%' OR
      NEW.app_metadata->>'provider' != 'email') THEN
    is_oauth_signup := TRUE;
    RAISE LOG 'DEBUG: Detected OAuth signup for user: %', user_email;
  ELSE
    RAISE LOG 'DEBUG: Detected email signup for user: %', user_email;
  END IF;

  -- Send welcome email for ALL confirmed signups (OAuth immediate, email after confirmation)
  IF NEW.confirmed_at IS NOT NULL THEN
    RAISE LOG 'INFO: Confirmed signup detected, sending welcome email for: % (ID: %)', user_email, NEW.id;
    
    -- Mark as sent BEFORE attempting to send (prevents duplicate calls)
    BEGIN
      INSERT INTO user_profiles (id, welcome_email_sent, welcome_email_sent_at)
      VALUES (NEW.id, TRUE, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        welcome_email_sent = TRUE, 
        welcome_email_sent_at = NOW();
      
      RAISE LOG 'DEBUG: Database flag updated successfully for user: %', user_email;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'ERROR: Failed to update user_profiles for user %: %', NEW.id, SQLERRM;
      RETURN NEW; -- Don't fail the user creation, but skip email
    END;
    
    -- Prepare JSON payload with user_id for deduplication
    BEGIN
      payload := json_build_object(
        'email', user_email,
        'name', user_name,
        'user_id', NEW.id::text
      )::TEXT;
      
      RAISE LOG 'DEBUG: Prepared payload for user %: %', user_email, payload;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'ERROR: Failed to build JSON payload for user %: %', user_email, SQLERRM;
      RETURN NEW;
    END;

    -- Make HTTP request to our welcome email API
    BEGIN
      RAISE LOG 'DEBUG: Making HTTP POST request to welcome email API for user: %', user_email;
      
      SELECT * FROM http_post(
        'https://kromio.ai/api/send-welcome-email',
        payload,
        'application/json'
      ) INTO http_response;

      RAISE LOG 'DEBUG: HTTP response received - Status: %, Content-Type: %', 
        http_response.status, http_response.headers->>'content-type';
        
      -- Log response content for debugging (first 500 chars)
      RAISE LOG 'DEBUG: HTTP response content: %', SUBSTRING(http_response.content, 1, 500);

    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'ERROR: HTTP request failed for user %: %', user_email, SQLERRM;
      -- Reset the flag if HTTP request failed completely
      UPDATE user_profiles 
      SET welcome_email_sent = FALSE, 
          welcome_email_sent_at = NULL
      WHERE id = NEW.id;
      RETURN NEW;
    END;

    -- Process the HTTP response
    IF http_response.status = 200 THEN
      RAISE LOG 'SUCCESS: Welcome email sent successfully for confirmed user: %', user_email;
    ELSE
      RAISE LOG 'ERROR: Welcome email API returned error status % for user: %', http_response.status, user_email;
      RAISE LOG 'ERROR: Response content: %', http_response.content;
      
      -- Reset the flag if email API returned an error
      BEGIN
        UPDATE user_profiles 
        SET welcome_email_sent = FALSE, 
            welcome_email_sent_at = NULL
        WHERE id = NEW.id;
        RAISE LOG 'DEBUG: Reset email flag due to API error for user: %', user_email;
      EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'ERROR: Failed to reset email flag for user %: %', user_email, SQLERRM;
      END;
    END IF;
    
  ELSE
    RAISE LOG 'INFO: Unconfirmed signup detected, skipping welcome email: %', user_email;
  END IF;

  RAISE LOG 'DEBUG: Welcome email trigger completed for user: %', user_email;
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'CRITICAL ERROR: Unexpected error in welcome email trigger for user %: %', COALESCE(user_email, 'UNKNOWN'), SQLERRM;
  RETURN NEW; -- Don't fail user creation even if email fails
END;
$$ LANGUAGE plpgsql;

-- Update the trigger function comment
COMMENT ON FUNCTION send_welcome_email_for_oauth() IS 
'Sends welcome email for ALL confirmed signups with comprehensive debug logging. Prevents duplicates via database flag.';

-- Log that the migration completed
DO $$
BEGIN
  RAISE LOG 'INFO: Welcome email trigger function updated with debug logging';
END
$$;