-- =============================================
-- WP-GEN Initial Database Schema
-- Run this in Supabase SQL Editor to set up all tables
-- =============================================

-- =============================================
-- 1. PLANS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price_cents INTEGER NOT NULL DEFAULT 0,
    tokens_per_month INTEGER,
    is_unlimited BOOLEAN NOT NULL DEFAULT FALSE,
    stripe_price_id TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default plans
INSERT INTO public.plans (name, description, price_cents, tokens_per_month, is_unlimited, is_active) VALUES
    ('free', 'Free plan with 5 credits per month', 0, 5, FALSE, TRUE),
    ('pro', 'Pro plan with 50 credits per month', 999, 50, FALSE, TRUE),
    ('unlimited', 'Unlimited plan with unlimited credits', 2999, NULL, TRUE, TRUE)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 2. USER PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_tokens INTEGER NOT NULL DEFAULT 5,
    total_tokens_used INTEGER NOT NULL DEFAULT 0,
    tokens_reset_at TIMESTAMPTZ,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    welcome_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    welcome_email_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 3. USER SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);

-- =============================================
-- 4. TOKEN TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus', 'reset')),
    description TEXT,
    extension_id UUID,
    subscription_id UUID REFERENCES public.user_subscriptions(id),
    balance_after INTEGER NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON public.token_transactions(created_at);

-- =============================================
-- 5. EXTENSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.extensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    prompt TEXT,
    revision_prompt TEXT,
    files JSONB NOT NULL DEFAULT '{}',
    version INTEGER NOT NULL DEFAULT 1,
    parent_id UUID REFERENCES public.extensions(id) ON DELETE SET NULL,
    ai_model TEXT,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    favorite_count INTEGER NOT NULL DEFAULT 0,
    has_uploaded_image BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_extensions_user_id ON public.extensions(user_id);
CREATE INDEX IF NOT EXISTS idx_extensions_parent_id ON public.extensions(parent_id);
CREATE INDEX IF NOT EXISTS idx_extensions_is_public ON public.extensions(is_public);
CREATE INDEX IF NOT EXISTS idx_extensions_created_at ON public.extensions(created_at);

-- Add foreign key for token_transactions.extension_id now that extensions table exists
ALTER TABLE public.token_transactions
    ADD CONSTRAINT fk_token_transactions_extension
    FOREIGN KEY (extension_id) REFERENCES public.extensions(id) ON DELETE SET NULL;

-- =============================================
-- 6. FAVORITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    extension_id UUID NOT NULL REFERENCES public.extensions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, extension_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_extension_id ON public.favorites(extension_id);

-- =============================================
-- 7. USER MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    extension_id UUID REFERENCES public.extensions(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('support', 'feedback')),
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'replied', 'resolved', 'closed')),
    admin_reply TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_messages_user_id ON public.user_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_status ON public.user_messages(status);

-- =============================================
-- TRIGGER: Auto-create user profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
    free_plan_id UUID;
BEGIN
    -- Get the free plan ID
    SELECT id INTO free_plan_id FROM public.plans WHERE name = 'free' LIMIT 1;

    -- Create user profile with default 5 tokens
    INSERT INTO public.user_profiles (id, current_tokens, total_tokens_used)
    VALUES (NEW.id, 5, 0)
    ON CONFLICT (id) DO NOTHING;

    -- Create free subscription for new user
    IF free_plan_id IS NOT NULL THEN
        INSERT INTO public.user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
        VALUES (NEW.id, free_plan_id, 'active', NOW(), NOW() + INTERVAL '1 month')
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

-- =============================================
-- RPC FUNCTION: get_user_token_info
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_token_info(user_uuid UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
    target_user_id UUID;
BEGIN
    -- Use provided UUID or current user
    target_user_id := COALESCE(user_uuid, auth.uid());

    IF target_user_id IS NULL THEN
        RETURN json_build_object('error', 'No user specified');
    END IF;

    SELECT json_build_object(
        'current_tokens', COALESCE(up.current_tokens, 5),
        'total_tokens_used', COALESCE(up.total_tokens_used, 0),
        'tokens_reset_at', up.tokens_reset_at,
        'plan', json_build_object(
            'name', COALESCE(p.name, 'free'),
            'tokens_per_month', p.tokens_per_month,
            'is_unlimited', COALESCE(p.is_unlimited, FALSE)
        ),
        'subscription', CASE
            WHEN us.id IS NOT NULL THEN json_build_object(
                'status', us.status,
                'current_period_end', us.current_period_end
            )
            ELSE NULL
        END
    ) INTO result
    FROM public.user_profiles up
    LEFT JOIN public.user_subscriptions us ON us.user_id = up.id AND us.status = 'active'
    LEFT JOIN public.plans p ON p.id = us.plan_id
    WHERE up.id = target_user_id;

    -- If no profile found, return defaults
    IF result IS NULL THEN
        RETURN json_build_object(
            'current_tokens', 5,
            'total_tokens_used', 0,
            'tokens_reset_at', NULL,
            'plan', json_build_object(
                'name', 'free',
                'tokens_per_month', 5,
                'is_unlimited', FALSE
            ),
            'subscription', NULL
        );
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC FUNCTION: deduct_tokens
-- =============================================
CREATE OR REPLACE FUNCTION public.deduct_tokens(
    user_uuid UUID,
    tokens_to_deduct INTEGER,
    description TEXT DEFAULT NULL,
    ext_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    current_balance INTEGER;
    is_unlimited BOOLEAN;
    new_balance INTEGER;
    transaction_uuid UUID;
BEGIN
    -- Get current balance and check if unlimited
    SELECT
        up.current_tokens,
        COALESCE(p.is_unlimited, FALSE)
    INTO current_balance, is_unlimited
    FROM public.user_profiles up
    LEFT JOIN public.user_subscriptions us ON us.user_id = up.id AND us.status = 'active'
    LEFT JOIN public.plans p ON p.id = us.plan_id
    WHERE up.id = user_uuid;

    -- If no profile found, return error
    IF current_balance IS NULL THEN
        RETURN json_build_object(
            'success', FALSE,
            'error', 'User profile not found',
            'tokens_remaining', 0,
            'unlimited', FALSE
        );
    END IF;

    -- If unlimited, don't deduct but record usage
    IF is_unlimited THEN
        -- Record transaction for tracking
        INSERT INTO public.token_transactions (user_id, amount, transaction_type, description, extension_id, balance_after)
        VALUES (user_uuid, -tokens_to_deduct, 'usage', description, ext_id, current_balance)
        RETURNING id INTO transaction_uuid;

        -- Update total used
        UPDATE public.user_profiles
        SET total_tokens_used = total_tokens_used + tokens_to_deduct,
            updated_at = NOW()
        WHERE id = user_uuid;

        RETURN json_build_object(
            'success', TRUE,
            'tokens_remaining', current_balance,
            'unlimited', TRUE,
            'transaction_id', transaction_uuid
        );
    END IF;

    -- Check if enough tokens
    IF current_balance < tokens_to_deduct THEN
        RETURN json_build_object(
            'success', FALSE,
            'error', 'Insufficient tokens',
            'tokens_remaining', current_balance,
            'unlimited', FALSE,
            'tokens_needed', tokens_to_deduct - current_balance
        );
    END IF;

    -- Deduct tokens
    new_balance := current_balance - tokens_to_deduct;

    UPDATE public.user_profiles
    SET current_tokens = new_balance,
        total_tokens_used = total_tokens_used + tokens_to_deduct,
        updated_at = NOW()
    WHERE id = user_uuid;

    -- Record transaction
    INSERT INTO public.token_transactions (user_id, amount, transaction_type, description, extension_id, balance_after)
    VALUES (user_uuid, -tokens_to_deduct, 'usage', description, ext_id, new_balance)
    RETURNING id INTO transaction_uuid;

    RETURN json_build_object(
        'success', TRUE,
        'tokens_remaining', new_balance,
        'unlimited', FALSE,
        'transaction_id', transaction_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC FUNCTION: add_tokens
-- =============================================
CREATE OR REPLACE FUNCTION public.add_tokens(
    user_uuid UUID,
    tokens_to_add INTEGER,
    transaction_type TEXT DEFAULT 'bonus',
    description TEXT DEFAULT NULL,
    subscription_uuid UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
    transaction_uuid UUID;
BEGIN
    -- Get current balance
    SELECT current_tokens INTO current_balance
    FROM public.user_profiles
    WHERE id = user_uuid;

    IF current_balance IS NULL THEN
        RETURN json_build_object(
            'success', FALSE,
            'error', 'User profile not found'
        );
    END IF;

    new_balance := current_balance + tokens_to_add;

    -- Update balance
    UPDATE public.user_profiles
    SET current_tokens = new_balance,
        updated_at = NOW()
    WHERE id = user_uuid;

    -- Record transaction
    INSERT INTO public.token_transactions (user_id, amount, transaction_type, description, subscription_id, balance_after)
    VALUES (user_uuid, tokens_to_add, transaction_type, description, subscription_uuid, new_balance)
    RETURNING id INTO transaction_uuid;

    RETURN json_build_object(
        'success', TRUE,
        'tokens_added', tokens_to_add,
        'new_balance', new_balance,
        'transaction_id', transaction_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC FUNCTION: get_all_users_admin
-- =============================================
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS JSON AS $$
DECLARE
    caller_is_admin BOOLEAN;
BEGIN
    -- Check if caller is admin
    SELECT is_admin INTO caller_is_admin
    FROM public.user_profiles
    WHERE id = auth.uid();

    IF NOT COALESCE(caller_is_admin, FALSE) THEN
        RETURN json_build_object('error', 'Unauthorized');
    END IF;

    RETURN (
        SELECT json_agg(row_to_json(users))
        FROM (
            SELECT
                au.id,
                au.email,
                au.created_at as signup_date,
                au.last_sign_in_at,
                up.current_tokens,
                up.total_tokens_used,
                up.is_admin,
                p.name as plan_name,
                us.status as subscription_status,
                (SELECT COUNT(*) FROM public.extensions WHERE user_id = au.id) as extension_count
            FROM auth.users au
            LEFT JOIN public.user_profiles up ON up.id = au.id
            LEFT JOIN public.user_subscriptions us ON us.user_id = au.id AND us.status = 'active'
            LEFT JOIN public.plans p ON p.id = us.plan_id
            ORDER BY au.created_at DESC
        ) users
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC FUNCTION: delete_user_safely
-- =============================================
CREATE OR REPLACE FUNCTION public.delete_user_safely(
    target_user_id UUID,
    keep_extensions BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    caller_is_admin BOOLEAN;
    ext_count INTEGER;
BEGIN
    -- Check if caller is admin
    SELECT is_admin INTO caller_is_admin
    FROM public.user_profiles
    WHERE id = auth.uid();

    IF NOT COALESCE(caller_is_admin, FALSE) THEN
        RETURN json_build_object('success', FALSE, 'error', 'Unauthorized');
    END IF;

    -- Count extensions
    SELECT COUNT(*) INTO ext_count FROM public.extensions WHERE user_id = target_user_id;

    -- Delete or anonymize extensions
    IF keep_extensions THEN
        UPDATE public.extensions SET user_id = auth.uid() WHERE user_id = target_user_id;
    END IF;

    -- Delete user (cascades to profiles, subscriptions, etc)
    DELETE FROM auth.users WHERE id = target_user_id;

    RETURN json_build_object(
        'success', TRUE,
        'extensions_count', ext_count,
        'extensions_preserved', keep_extensions
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC FUNCTION: admin_update_user_tokens
-- =============================================
CREATE OR REPLACE FUNCTION public.admin_update_user_tokens(
    target_user_id UUID,
    new_token_count INTEGER,
    reason TEXT DEFAULT 'Admin adjustment'
)
RETURNS JSON AS $$
DECLARE
    caller_is_admin BOOLEAN;
    old_tokens INTEGER;
    diff INTEGER;
BEGIN
    -- Check if caller is admin
    SELECT is_admin INTO caller_is_admin
    FROM public.user_profiles
    WHERE id = auth.uid();

    IF NOT COALESCE(caller_is_admin, FALSE) THEN
        RETURN json_build_object('success', FALSE, 'error', 'Unauthorized');
    END IF;

    -- Get old balance
    SELECT current_tokens INTO old_tokens
    FROM public.user_profiles
    WHERE id = target_user_id;

    IF old_tokens IS NULL THEN
        RETURN json_build_object('success', FALSE, 'error', 'User not found');
    END IF;

    diff := new_token_count - old_tokens;

    -- Update tokens
    UPDATE public.user_profiles
    SET current_tokens = new_token_count, updated_at = NOW()
    WHERE id = target_user_id;

    -- Record transaction
    INSERT INTO public.token_transactions (user_id, amount, transaction_type, description, balance_after)
    VALUES (target_user_id, diff, 'bonus', reason, new_token_count);

    RETURN json_build_object(
        'success', TRUE,
        'old_token_count', old_tokens,
        'new_token_count', new_token_count,
        'difference', diff,
        'message', 'Tokens updated successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC FUNCTION: admin_get_user_token_history
-- =============================================
CREATE OR REPLACE FUNCTION public.admin_get_user_token_history(
    target_user_id UUID,
    limit_count INTEGER DEFAULT 50
)
RETURNS JSON AS $$
DECLARE
    caller_is_admin BOOLEAN;
BEGIN
    -- Check if caller is admin
    SELECT is_admin INTO caller_is_admin
    FROM public.user_profiles
    WHERE id = auth.uid();

    IF NOT COALESCE(caller_is_admin, FALSE) THEN
        RETURN json_build_object('error', 'Unauthorized');
    END IF;

    RETURN (
        SELECT json_agg(row_to_json(t))
        FROM (
            SELECT *
            FROM public.token_transactions
            WHERE user_id = target_user_id
            ORDER BY created_at DESC
            LIMIT limit_count
        ) t
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC FUNCTION: get_admin_messages
-- =============================================
CREATE OR REPLACE FUNCTION public.get_admin_messages(filter_type TEXT DEFAULT 'all')
RETURNS JSON AS $$
DECLARE
    caller_is_admin BOOLEAN;
BEGIN
    -- Check if caller is admin
    SELECT is_admin INTO caller_is_admin
    FROM public.user_profiles
    WHERE id = auth.uid();

    IF NOT COALESCE(caller_is_admin, FALSE) THEN
        RETURN json_build_object('error', 'Unauthorized');
    END IF;

    RETURN (
        SELECT json_agg(row_to_json(m))
        FROM (
            SELECT
                um.*,
                au.email as user_email,
                e.name as extension_name
            FROM public.user_messages um
            LEFT JOIN auth.users au ON au.id = um.user_id
            LEFT JOIN public.extensions e ON e.id = um.extension_id
            WHERE
                filter_type = 'all' OR
                (filter_type = 'support' AND um.type = 'support') OR
                (filter_type = 'feedback' AND um.type = 'feedback') OR
                (filter_type = 'open' AND um.status = 'open') OR
                (filter_type = 'replied' AND um.status = 'replied')
            ORDER BY um.created_at DESC
        ) m
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC FUNCTION: reset_welcome_email_flag
-- =============================================
CREATE OR REPLACE FUNCTION public.reset_welcome_email_flag(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = user_email;

    IF target_user_id IS NULL THEN
        RETURN json_build_object('success', FALSE, 'error', 'User not found');
    END IF;

    UPDATE public.user_profiles
    SET welcome_email_sent = FALSE, welcome_email_sent_at = NULL
    WHERE id = target_user_id;

    RETURN json_build_object('success', TRUE, 'message', 'Welcome email flag reset');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC FUNCTION: check_welcome_email_status
-- =============================================
CREATE OR REPLACE FUNCTION public.check_welcome_email_status(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    result RECORD;
BEGIN
    SELECT up.welcome_email_sent, up.welcome_email_sent_at
    INTO result
    FROM public.user_profiles up
    JOIN auth.users au ON au.id = up.id
    WHERE au.email = user_email;

    IF result IS NULL THEN
        RETURN json_build_object('success', FALSE, 'error', 'User not found');
    END IF;

    RETURN json_build_object(
        'success', TRUE,
        'welcome_email_sent', result.welcome_email_sent,
        'welcome_email_sent_at', result.welcome_email_sent_at
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;

-- Plans: Anyone can read active plans
CREATE POLICY "Anyone can read active plans" ON public.plans
    FOR SELECT USING (is_active = TRUE);

-- User Profiles: Users can read/update their own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- User Subscriptions: Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Token Transactions: Users can read their own transactions
CREATE POLICY "Users can read own transactions" ON public.token_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Extensions: Users can CRUD their own, read public ones
CREATE POLICY "Users can read own extensions" ON public.extensions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read public extensions" ON public.extensions
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can insert own extensions" ON public.extensions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own extensions" ON public.extensions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own extensions" ON public.extensions
    FOR DELETE USING (auth.uid() = user_id);

-- Favorites: Users can CRUD their own favorites
CREATE POLICY "Users can read own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- User Messages: Users can read/insert their own messages
CREATE POLICY "Users can read own messages" ON public.user_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON public.user_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.token_transactions TO authenticated;
GRANT ALL ON public.extensions TO authenticated;
GRANT ALL ON public.favorites TO authenticated;
GRANT ALL ON public.user_messages TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_user_token_info TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_safely TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_user_token_history TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_messages TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_welcome_email_flag TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_welcome_email_status TO authenticated;
