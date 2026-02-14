-- Update credit allocations for pricing tiers (90% profit margin)
-- Freelancer: 500 credits/month
-- Agency: 2,000 credits/month
-- Enterprise: 6,000 credits/month (no longer unlimited)

UPDATE public.plans SET tokens_per_month = 500 WHERE name = 'freelancer';
UPDATE public.plans SET tokens_per_month = 2000 WHERE name = 'agency';
UPDATE public.plans SET tokens_per_month = 6000, is_unlimited = FALSE WHERE name = 'enterprise';
