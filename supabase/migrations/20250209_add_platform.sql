-- Add platform column to extensions table for multi-platform support
-- Default to 'wordpress' so existing extensions are unaffected

ALTER TABLE public.extensions
ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'wordpress';

-- Add a comment explaining the column
COMMENT ON COLUMN public.extensions.platform IS 'Platform type: wordpress, google-sheets, etc.';

-- Create an index for platform filtering (useful for gallery filtering)
CREATE INDEX IF NOT EXISTS idx_extensions_platform ON public.extensions(platform);
