-- Update plans table with new pricing tiers
-- Run this in Supabase SQL Editor

-- First, delete old plans
DELETE FROM public.plans WHERE name IN ('pro', 'unlimited');

-- Update free plan
UPDATE public.plans
SET tokens_per_month = 3,
    description = 'Perfect for trying out the platform',
    updated_at = NOW()
WHERE name = 'free';

-- Insert new plans
INSERT INTO public.plans (name, description, price_cents, tokens_per_month, is_unlimited, stripe_price_id, is_active)
VALUES
    ('freelancer', 'For individual developers and creators', 9900, 10, FALSE, 'price_1SxSVzLkI17DtQuz6gzXKUWK', TRUE),
    ('agency', 'For teams and agencies', 29900, 50, FALSE, 'price_1SxSc6LkI17DtQuzVwYMUZjJ', TRUE),
    ('enterprise', 'For large teams and businesses', 79900, NULL, TRUE, 'price_1SxSeWLkI17DtQuzl42dIK3X', TRUE)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    price_cents = EXCLUDED.price_cents,
    tokens_per_month = EXCLUDED.tokens_per_month,
    is_unlimited = EXCLUDED.is_unlimited,
    stripe_price_id = EXCLUDED.stripe_price_id,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verify the changes
SELECT * FROM public.plans ORDER BY price_cents;
